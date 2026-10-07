import { useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { Check, User } from "lucide-react";
import MeetwiseLogo from "../components/MeetwiseLogo";

const API_URL = "http://localhost:5000/api/auth/register";
const EMAIL_PATTERN = /^\S+@\S+\.\S+$/;


function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "";

  const first = Array.from(parts[0])[0];
  const last = parts.length > 1 ? Array.from(parts[parts.length - 1])[0] : "";

  return (first + last).toUpperCase();
}

// 1 = too short (the server rejects it), 4 = strong
function getStrength(password) {
  if (!password) return { level: 0, label: "Not set yet" };
  if (password.length < 6) return { level: 1, label: "Too short" };

  let level = 2;
  if (password.length >= 10) level += 1;
  if (/[A-Za-z]/.test(password) && /\d/.test(password)) level += 1;
  if (
    /[^A-Za-z0-9]/.test(password) ||
    (/[a-z]/.test(password) && /[A-Z]/.test(password))
  ) {
    level += 1;
  }

  level = Math.min(level, 4);
  return { level, label: ["", "Too short", "Fair", "Good", "Strong"][level] };
}

// Turns the name + email into a stable barcode, so the pass
function makeBars(seed) {
  let h = 2166136261;
  for (const ch of seed) {
    h ^= ch.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  h = h || 1;

  const bars = [];
  for (let i = 0; i < 30; i += 1) {
    h ^= h << 13;
    h ^= h >>> 17;
    h ^= h << 5;
    bars.push(1 + (Math.abs(h) % 4));
  }
  return bars;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;


function Register() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [issued, setIssued] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);

  const tiltRef = useRef(null);
  const redirectTimer = useRef(null);

  const [issuedDate] = useState(() =>
    new Date().toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  );

  useEffect(() => () => clearTimeout(redirectTimer.current), []);


  const nameValid = name.trim().length > 1;
  const emailValid = EMAIL_PATTERN.test(email.trim());
  const passwordValid = password.length >= 6;
  const passwordsMatch = confirmPassword.length > 0 && confirmPassword === password;
  const mismatch = confirmPassword.length > 0 && confirmPassword !== password;

  const progress =
    [nameValid, emailValid, passwordValid, passwordsMatch].filter(Boolean).length / 4;

  const strength = getStrength(password);
  const hasLettersAndNumbers = /[A-Za-z]/.test(password) && /\d/.test(password);
  const initials = getInitials(name);
 const bars = useMemo(
  () => makeBars(`${name.trim()}|${email.trim()}`),
  [name, email]
);

  const flipped = passwordFocused && !issued;
  const status = issued ? "Issued" : progress === 1 ? "Ready" : "In progress";


  const handlePointerMove = (e) => {
    const el = tiltRef.current;
    if (!el || prefersReducedMotion()) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;

    el.style.setProperty("--ry", `${x * 28}deg`);
    el.style.setProperty("--rx", `${-y * 20}deg`);
    el.style.setProperty("--mx", `${(x + 0.5) * 100}%`);
    el.style.setProperty("--my", `${(y + 0.5) * 100}%`);
  };

  const resetTilt = () => {
    const el = tiltRef.current;
    if (!el) return;

    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--mx", "50%");
    el.style.setProperty("--my", "30%");
  };


  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setPasswordFocused(false);

    if (!name.trim() || !email.trim() || !password) {
      setError("Enter your name, email and a password.");
      return;
    }

    if (!emailValid) {
      setError("Enter a valid email address, like you@example.com.");
      return;
    }

    if (password.length < 6) {
      setError("Use a password with at least 6 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("The two passwords don't match. Re-type them and try again.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Could not create your account.");
      }

      setIssued(true);
      redirectTimer.current = setTimeout(
        () => navigate("/login"),
        prefersReducedMotion() ? 500 : 1900
      );
    } catch (err) {
      console.error("Registration error:", err);

      setError(
        err instanceof TypeError
          ? "Can't reach the server. Make sure it's running on port 5000."
          : err.message
      );
    } finally {
      setLoading(false);
    }
  }

  const locked = loading || issued;

  return (
    <Page style={{ "--p": progress }}>
      <Glow aria-hidden="true" />

      <TopBar>
        <Brand to="/">
          <BrandMark><MeetwiseLogo size={27} /></BrandMark>
          <BrandName>Meetwise</BrandName>
        </Brand>

        <TopText>
          <TopHint>Have an account?</TopHint>{" "}
          <InlineLink to="/login">Log in</InlineLink>
        </TopText>
      </TopBar>

      <Main>
        <FormSection>
          <FormCard>
            <FormTitle>Create your account</FormTitle>
            <FormDescription>
              Turn meeting transcripts into summaries and action items.
            </FormDescription>

            <Form onSubmit={handleSubmit} noValidate>
              <Field>
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  type="text"
                  autoComplete="name"
                  placeholder="Muhammad Zaid"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={locked}
                />
              </Field>

              <Field>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={locked}
                />
              </Field>

              <Field>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="new-password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  disabled={locked}
                />
              </Field>

              <Field>
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  placeholder="Type the password again"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  onFocus={() => setPasswordFocused(true)}
                  onBlur={() => setPasswordFocused(false)}
                  aria-invalid={mismatch}
                  $invalid={mismatch}
                  disabled={locked}
                />
              </Field>

              {error && <ErrorMessage role="alert">{error}</ErrorMessage>}

              <SubmitButton type="submit" disabled={locked}>
                {issued
                  ? "Account created"
                  : loading
                  ? "Creating account..."
                  : "Create account"}
              </SubmitButton>
            </Form>
          </FormCard>
        </FormSection>

        <Stage
          aria-hidden="true"
          onPointerMove={handlePointerMove}
          onPointerLeave={resetTilt}
        >
          <Scale>
            <Sway>
              <Strap />
              <Clip />

              <TiltLayer ref={tiltRef}>
                <FlipLayer $flipped={flipped}>
                  <Face $front>
                    <Slot />

                    <TopRow>
                      <PassMark><MeetwiseLogo size={27} /></PassMark>
                      <div>
                        <PassBrand>Meetwise</PassBrand>
                        <PassKind>Workspace pass</PassKind>
                      </div>
                    </TopRow>

                    <AvatarRing>
                      <Avatar>
                        {initials ? initials : <User size={40} strokeWidth={1.6} />}
                      </Avatar>
                    </AvatarRing>

                    <PassName $empty={!name.trim()}>
                      {name.trim() || "Your name"}
                    </PassName>
                    <PassEmail $empty={!email.trim()}>
                      {email.trim() || "you@example.com"}
                    </PassEmail>

                    <Barcode>
                      {bars.map((w, i) => (
                        <Bar key={i} style={{ width: `${w}px` }} />
                      ))}
                    </Barcode>

                    <PassFooter>
                      <div>
                        <FooterLabel>Issued</FooterLabel>
                        <FooterValue>{issuedDate}</FooterValue>
                      </div>
                      <Status $state={issued ? "issued" : progress === 1 ? "ready" : "idle"}>
                        <StatusDot />
                        {status}
                      </Status>
                    </PassFooter>

                    <Sheen />
                    {issued && <Stamp>Pass issued</Stamp>}
                  </Face>

                  <Face>
                    <Slot />
                    <Stripe />

                    <BackBody>
                      <BackTitle>Secure your pass</BackTitle>
                      <BackText>Your password never appears on the pass.</BackText>

                      <Meter>
                        {[1, 2, 3, 4].map((n) => (
                          <Segment key={n} $on={n <= strength.level} $level={strength.level} />
                        ))}
                      </Meter>
                      <MeterLabel>{strength.label}</MeterLabel>

                      <Rules>
                        <Rule $met={passwordValid}>
                          <RuleIcon $met={passwordValid}>
                            {passwordValid && <Check size={12} strokeWidth={3} />}
                          </RuleIcon>
                          At least 6 characters
                        </Rule>
                        <Rule $met={hasLettersAndNumbers}>
                          <RuleIcon $met={hasLettersAndNumbers}>
                            {hasLettersAndNumbers && <Check size={12} strokeWidth={3} />}
                          </RuleIcon>
                          Letters and numbers
                        </Rule>
                        <Rule $met={passwordsMatch}>
                          <RuleIcon $met={passwordsMatch}>
                            {passwordsMatch && <Check size={12} strokeWidth={3} />}
                          </RuleIcon>
                          Both passwords match
                        </Rule>
                      </Rules>
                    </BackBody>

                    <BackTip>
                      Use a password you don't use on any other site.
                    </BackTip>
                  </Face>
                </FlipLayer>
              </TiltLayer>

              <Caption>Your pass fills in as you type.</Caption>
            </Sway>
          </Scale>
        </Stage>
      </Main>
    </Page>
  );
}

export default Register;


const swing = keyframes`
  0%, 100% { transform: rotateZ(-1.6deg); }
  50%      { transform: rotateZ(1.6deg); }
`;

const stampIn = keyframes`
  0%   { opacity: 0; transform: translate(-50%, -50%) rotate(-10deg) scale(2.4); }
  70%  { opacity: 1; transform: translate(-50%, -50%) rotate(-10deg) scale(0.94); }
  100% { opacity: 1; transform: translate(-50%, -50%) rotate(-10deg) scale(1); }
`;


const Page = styled.div`
  position: relative;
  min-height: 100vh;
  width: 100%;
  overflow-x: hidden;
  color: #ffffff;
  background: linear-gradient(135deg, #0e131c, #080b11 60%, #05070a);
`;

const Glow = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: radial-gradient(
    circle at 74% 48%,
    rgba(50, 150, 255, 0.28),
    transparent 42%
  );
  opacity: calc(0.5 + var(--p, 0) * 0.5);
  transition: opacity 1s ease;

  @media (max-width: 900px) {
    background: radial-gradient(
      circle at 50% 22%,
      rgba(50, 150, 255, 0.28),
      transparent 50%
    );
  }
`;

const TopBar = styled.header`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 5;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;

  @media (max-width: 500px) {
    padding: 0 18px;
  }
`;

const Brand = styled(Link)`
  display: flex;
  align-items: center;
  gap: 10px;
  color: inherit;
  text-decoration: none;
`;

const BrandMark = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  background: #1683d8;
  font-size: 15px;
  font-weight: 800;
`;

const BrandName = styled.span`
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.01em;

  @media (max-width: 500px) {
    display: none;
  }
`;

const TopText = styled.p`
  font-size: 13px;
  color: #9aa7b8;
`;

const TopHint = styled.span`
  @media (max-width: 500px) {
    display: none;
  }
`;

const InlineLink = styled(Link)`
  margin-left: 4px;
  font-weight: 700;
  color: #6cc3ff;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    outline: 2px solid #6cc3ff;
    outline-offset: 3px;
    border-radius: 4px;
  }
`;

const Main = styled.main`
  position: relative;
  min-height: 100vh;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);

  @media (max-width: 900px) {
    display: flex;
    flex-direction: column;
    min-height: 0;
  }
`;


const FormSection = styled.section`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 96px 40px 56px;

  @media (max-width: 900px) {
    padding: 8px 20px 48px;
  }
`;

const FormCard = styled.div`
  width: 100%;
  max-width: 420px;
  padding: 34px;
  border-radius: 24px;
  background: rgba(20, 28, 41, 0.66);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  box-shadow:
    0 30px 80px rgba(0, 0, 0, 0.45),
    inset 0 1px rgba(255, 255, 255, 0.07);

  @media (max-width: 500px) {
    padding: 26px 22px;
  }
`;

const FormTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  line-height: 1.2;

  @media (max-width: 500px) {
    font-size: 24px;
  }
`;

const FormDescription = styled.p`
  margin-top: 8px;
  font-size: 14px;
  line-height: 1.5;
  color: #9aa7b8;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 18px;
  margin-top: 26px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Label = styled.label`
  font-size: 13px;
  color: #c4cedb;
`;

const Input = styled.input`
  width: 100%;
  padding: 13px 15px;
  border-radius: 10px;
  border: 1px solid
    ${({ $invalid }) =>
      $invalid ? "rgba(255, 120, 120, 0.6)" : "rgba(255, 255, 255, 0.12)"};
  outline: none;
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
  font-size: 14px;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;

  &::placeholder {
    color: #6b7788;
  }

  &:focus {
    border-color: ${({ $invalid }) =>
      $invalid ? "rgba(255, 120, 120, 0.85)" : "rgba(108, 195, 255, 0.75)"};
    background: rgba(255, 255, 255, 0.09);
    box-shadow: 0 0 0 3px
      ${({ $invalid }) =>
        $invalid ? "rgba(255, 120, 120, 0.14)" : "rgba(80, 170, 255, 0.16)"};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid rgba(255, 120, 120, 0.3);
  background: rgba(255, 110, 110, 0.1);
  color: #ffa3a3;
  font-size: 13px;
  line-height: 1.45;
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 10px;
  background: linear-gradient(110deg, #1683d8, #3fa4f0 50%, #1683d8);
  background-size: 200% 100%;
  color: #ffffff;
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.3s ease,
    background-position 0.6s ease;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    background-position: 100% 0;
    box-shadow: 0 8px 25px rgba(22, 131, 216, 0.4);
  }

  &:focus-visible {
    outline: 2px solid #6cc3ff;
    outline-offset: 3px;
  }

  &:disabled {
    opacity: 0.65;
    cursor: not-allowed;
  }
`;


const Stage = styled.section`
  position: relative;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  touch-action: pan-y;

  @media (max-width: 900px) {
    order: -1;
    min-height: 0;
    height: 340px;
    overflow: hidden;
  }
`;

// Scales the whole hanging pass down on phones. The perspective
const Scale = styled.div`
  --s: 1;
  --strap: clamp(60px, calc(50vh - 270px), 200px);
  perspective: 1300px;
  transform: scale(var(--s));
  transform-origin: 50% 0;

  @media (max-width: 900px) {
    --s: 0.58;
    --strap: 122px;
  }
`;

const Sway = styled.div`
  position: relative;
  width: 292px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transform-style: preserve-3d;
  transform-origin: 50% 0;
  animation: ${swing} 6.5s ease-in-out infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const Strap = styled.div`
  position: relative;
  width: 36px;
  height: var(--strap);
  background: linear-gradient(90deg, #0f4a78, #1683d8 30%, #1683d8 70%, #0f4a78);

  &::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    border-left: 2px dashed rgba(255, 255, 255, 0.28);
    transform: translateX(-1px);
  }
`;

const Clip = styled.div`
  position: relative;
  z-index: 3;
  width: 46px;
  height: 22px;
  margin-top: -2px;
  margin-bottom: -12px;
  border-radius: 6px 6px 8px 8px;
  background: linear-gradient(180deg, #e6ecf3, #8f9cae 55%, #c3ccd8);
  box-shadow:
    0 3px 8px rgba(0, 0, 0, 0.45),
    inset 0 1px rgba(255, 255, 255, 0.7);
`;

const TiltLayer = styled.div`
  position: relative;
  width: 292px;
  height: 420px;
  transform-style: preserve-3d;
  transform-origin: 50% 14px;
  transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
  will-change: transform;

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const FlipLayer = styled.div`
  position: absolute;
  inset: 0;
  transform-style: preserve-3d;
  transform: rotateY(${({ $flipped }) => ($flipped ? "180deg" : "0deg")});
  transition: transform 0.85s cubic-bezier(0.2, 0.9, 0.25, 1);

  @media (prefers-reduced-motion: reduce) {
    transition: none;
  }
`;

const Face = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  padding: 22px 24px;
  border-radius: 22px;
  overflow: hidden;
  backface-visibility: hidden;
  -webkit-backface-visibility: hidden;
  transform: ${({ $front }) => ($front ? "none" : "rotateY(180deg)")};
  background: linear-gradient(160deg, #1e2c41 0%, #111a29 55%, #0b121d 100%);
  border: 1px solid rgba(255, 255, 255, 0.14);
  box-shadow:
    inset 0 1px rgba(255, 255, 255, 0.12),
    0 40px 80px rgba(0, 0, 0, 0.55),
    0 0 calc(var(--p, 0) * 70px) rgba(70, 165, 255, calc(0.1 + var(--p, 0) * 0.3));
  transition: box-shadow 0.8s ease;
`;

const Slot = styled.div`
  align-self: center;
  width: 52px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 4px;
  background: #05080d;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.9);
`;


const TopRow = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 22px;
`;

const PassMark = styled.div`
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #1683d8;
  font-size: 14px;
  font-weight: 800;
`;

const PassBrand = styled.p`
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
`;

const PassKind = styled.p`
  font-size: 11.5px;
  color: #7f8ca0;
`;

const AvatarRing = styled.div`
  width: 108px;
  height: 108px;
  margin-top: 26px;
  padding: 6px;
  border-radius: 50%;
  background: conic-gradient(
    #6cc3ff calc(var(--p, 0) * 360deg),
    rgba(255, 255, 255, 0.12) 0
  );
`;

const Avatar = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: linear-gradient(145deg, #27446a, #16283d);
  color: #dcecff;
  font-size: 34px;
  font-weight: 700;
`;

const PassName = styled.p`
  margin-top: 22px;
  font-size: 25px;
  font-weight: 700;
  line-height: 1.15;
  overflow-wrap: anywhere;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  color: ${({ $empty }) => ($empty ? "rgba(255,255,255,0.28)" : "#ffffff")};
`;

const PassEmail = styled.p`
  margin-top: 8px;
  margin-bottom: 18px;
  font-size: 13px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  color: ${({ $empty }) => ($empty ? "rgba(154,167,184,0.4)" : "#9aa7b8")};
`;

const Barcode = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  height: 44px;
  margin-top: auto;
  opacity: 0.85;
`;

const Bar = styled.div`
  background: #dcecff;
  border-radius: 1px;
`;

const PassFooter = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-top: 14px;
`;

const FooterLabel = styled.p`
  font-size: 11px;
  color: #7f8ca0;
`;

const FooterValue = styled.p`
  font-size: 13px;
  font-weight: 600;
`;

const statusColors = {
  idle: "#8b98ab",
  ready: "#6cc3ff",
  issued: "#5ee0a8",
};

const Status = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 6px 11px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.05);
  font-size: 12px;
  font-weight: 600;
  color: ${({ $state }) => statusColors[$state]};
`;

const StatusDot = styled.span`
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: currentColor;
`;

const Sheen = styled.div`
  position: absolute;
  inset: 0;
  pointer-events: none;
  background:
    radial-gradient(
      circle at var(--mx, 50%) var(--my, 30%),
      rgba(150, 205, 255, 0.13),
      transparent 46%
    ),
    linear-gradient(
      115deg,
      transparent calc(var(--mx, 50%) - 22%),
      rgba(120, 220, 255, 0.07) var(--mx, 50%),
      transparent calc(var(--mx, 50%) + 22%)
    );
`;

const Stamp = styled.div`
  position: absolute;
  top: 36%;
  left: 67%;
  padding: 7px 14px;
  border: 3px solid #5ee0a8;
  border-radius: 10px;
  background: rgba(8, 14, 22, 0.72);
  color: #5ee0a8;
  font-size: 19px;
  font-weight: 800;
  white-space: nowrap;
  transform: translate(-50%, -50%) rotate(-10deg);
  animation: ${stampIn} 0.5s cubic-bezier(0.2, 1, 0.3, 1) both;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;


const Stripe = styled.div`
  position: absolute;
  top: 40px;
  left: 0;
  right: 0;
  height: 46px;
  background: #04070b;
`;

const BackBody = styled.div`
  margin-top: 76px;
`;

const BackTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
`;

const BackText = styled.p`
  margin-top: 6px;
  font-size: 12.5px;
  line-height: 1.45;
  color: #8b98ab;
`;

const Meter = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 6px;
  margin-top: 24px;
`;

const levelColors = { 1: "#ff7a7a", 2: "#f5c25b", 3: "#6cc3ff", 4: "#5ee0a8" };

const Segment = styled.div`
  height: 6px;
  border-radius: 3px;
  background: ${({ $on, $level }) =>
    $on ? levelColors[$level] : "rgba(255, 255, 255, 0.12)"};
  transition: background 0.3s ease;
`;

const MeterLabel = styled.p`
  margin-top: 9px;
  font-size: 13px;
  font-weight: 600;
  color: #c4cedb;
`;

const BackTip = styled.p`
  margin-top: auto;
  padding-top: 14px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 12px;
  line-height: 1.5;
  color: #7f8ca0;
`;

const Rules = styled.ul`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 22px;
  list-style: none;
`;

const Rule = styled.li`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 13px;
  color: ${({ $met }) => ($met ? "#e8f2ff" : "#7f8ca0")};
  transition: color 0.3s ease;
`;

const RuleIcon = styled.span`
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border-radius: 50%;
  border: 1.5px solid
    ${({ $met }) => ($met ? "#1683d8" : "rgba(255, 255, 255, 0.22)")};
  background: ${({ $met }) => ($met ? "#1683d8" : "transparent")};
  color: #ffffff;
  transition:
    background 0.3s ease,
    border-color 0.3s ease;
`;

const Caption = styled.p`
  margin-top: 34px;
  text-align: center;
  font-size: 13px;
  color: #7f8ca0;

  @media (max-width: 900px) {
    display: none;
  }
`;
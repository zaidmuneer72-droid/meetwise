import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled, { keyframes, css } from "styled-components";
import MeetwiseLogo from "../components/MeetwiseLogo";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [isAccessGranted, setIsAccessGranted] = useState(false);
  const [isSwiping, setIsSwiping] = useState(false);

  const handleKeycardAccess = () => {
    if (isAccessGranted || isSwiping) return;

    setIsSwiping(true);
    setError("");

    setTimeout(() => {
      setIsSwiping(false);
      setIsAccessGranted(true);
    }, 700);
  };

  const resetElevator = () => {
    setIsAccessGranted(false);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !password.trim()) {
      setError("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Header>
        <BackButton onClick={resetElevator} title="Lock Doors / Reset">
          ←
        </BackButton>
        <Title><MeetwiseLogo size={28} /> Meetwise Express Elevator</Title>
        <HeaderSpacer />
      </Header>

      <Main>
        <ElevatorFrame>
          <FloorDisplayArea>
            <DirectionArrow $active={isAccessGranted}>▲</DirectionArrow>
            <FloorNumber $active={isAccessGranted}>
              {isAccessGranted ? "FL 77" : "LOBBY"}
            </FloorNumber>
            <StatusText $active={isAccessGranted}>
              {isAccessGranted ? "AUTHORIZED" : "RESTRICTED"}
            </StatusText>
          </FloorDisplayArea>

          <ElevatorShaft>
            <DoorLeft $isOpen={isAccessGranted} />
            <DoorRight $isOpen={isAccessGranted} />

            {!isAccessGranted && (
              <AccessOverlay>
                <KeycardReader onClick={handleKeycardAccess}>
                  <SensorLight $isSwiping={isSwiping} />
                  <CardSlot />
                  <SwipePrompt>
                    {isSwiping ? "VERIFYING KEYCARD..." : "TAP KEYCARD TO ACCESS"}
                  </SwipePrompt>
                  <CardGraphic $isSwiping={isSwiping}>
                    <span>PASS</span>
                  </CardGraphic>
                </KeycardReader>
              </AccessOverlay>
            )}

            <LoginSection $isOpen={isAccessGranted}>
              <LoginCard>
                <FormHeader>
                  <SmallText>Executive Floor Access</SmallText>
                  <FormTitle>Sign In</FormTitle>
                  <FormDescription>
                    Provide credentials for deck authorization
                  </FormDescription>
                </FormHeader>

                <Form onSubmit={handleSubmit}>
                  <Field>
                    <Label htmlFor="email">Work Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="name@company.com"
                      autoComplete="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={!isAccessGranted || loading}
                    />
                  </Field>

                  <Field>
                    <Label htmlFor="password">Passcode</Label>
                   <Input
  id="password"
  type="password"
  placeholder="••••••••"
  value={password}
  onChange={(e) => setPassword(e.target.value)}
  autoComplete="current-password"
  required
  disabled={!isAccessGranted || loading}
/>
                  </Field>

                  {error && <ErrorMessage>{error}</ErrorMessage>}

                 <FormOptions>
  <RememberMe>
    <Checkbox
      type="checkbox"
      disabled={!isAccessGranted || loading}
    />
    <RememberText>Stay Logged In</RememberText>
  </RememberMe>

  <ForgotLink to="/forgot-password">
    Forgot password?
  </ForgotLink>
</FormOptions>

                  <ElevatorButton
                    type="submit"
                    disabled={!isAccessGranted || loading}
                  >
                    {loading ? "ASCENDING..." : "ASCEND TO DASHBOARD"}
                  </ElevatorButton>

                  <SignupText>
                    New crew member?{" "}
                    <SignupLink
                      to="/register"
                      onClick={(e) => {
                        if (!isAccessGranted || loading) e.preventDefault();
                      }}
                    >
                      Request Keycard
                    </SignupLink>
                  </SignupText>
                </Form>
              </LoginCard>
            </LoginSection>
          </ElevatorShaft>
        </ElevatorFrame>
      </Main>
    </Page>
  );
}

export default Login;


const swipeMotion = keyframes`
  0% { transform: translateY(0); }
  50% { transform: translateY(18px); }
  100% { transform: translateY(0); }
`;


const Page = styled.div`
  min-height: 100vh;
  width: 100%;
  background: radial-gradient(circle at 50% 30%, #1a2230 0%, #080c14 100%);
  color: white;
  overflow: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
`;

const Header = styled.header`
  height: 80px;
  display: grid;
  grid-template-columns: 80px 1fr 80px;
  align-items: center;
  padding: 0 30px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(10, 15, 25, 0.5);
  backdrop-filter: blur(10px);
`;

const BackButton = styled.button`
  width: 40px;
  height: 40px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  color: white;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: #00f0ff;
  }
`;

const Title = styled.h1`
  margin: 0;
  text-align: center;
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: #c0c9d6;
`;

const HeaderSpacer = styled.div``;

const Main = styled.main`
  min-height: calc(100vh - 80px);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 20px;
`;


const ElevatorFrame = styled.div`
  width: 440px;
  background: linear-gradient(180deg, #2b323d 0%, #181d24 100%);
  border-radius: 20px;
  padding: 24px;
  border: 2px solid #3d4654;
  box-shadow: 0 30px 90px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.2);
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FloorDisplayArea = styled.div`
  background: #090d14;
  border-radius: 10px;
  padding: 12px 20px;
  border: 1px solid #232d3d;
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const DirectionArrow = styled.span`
  font-size: 18px;
  color: ${({ $active }) => ($active ? "#00f0ff" : "#3b485d")};
  text-shadow: ${({ $active }) => ($active ? "0 0 10px #00f0ff" : "none")};
  transition: all 0.5s ease;
`;

const FloorNumber = styled.span`
  font-family: monospace;
  font-size: 22px;
  font-weight: 700;
  letter-spacing: 2px;
  color: ${({ $active }) => ($active ? "#00f0ff" : "#ff4d4d")};
  text-shadow: ${({ $active }) =>
    $active ? "0 0 12px rgba(0, 240, 255, 0.6)" : "0 0 12px rgba(255, 77, 77, 0.6)"};
  transition: all 0.5s ease;
`;

const StatusText = styled.span`
  font-size: 11px;
  letter-spacing: 1px;
  font-weight: 600;
  color: ${({ $active }) => ($active ? "#4cd964" : "#ff9500")};
`;

const ElevatorShaft = styled.div`
  position: relative;
  width: 100%;
  min-height: 460px;
  border-radius: 12px;
  overflow: hidden;
  background: #0f141c;
  border: 1px solid #28303d;
`;


const DoorStyles = css`
  position: absolute;
  top: 0;
  bottom: 0;
  width: 50%;
  background: linear-gradient(
    90deg,
    #2c3340 0%,
    #3d4757 50%,
    #212733 100%
  );
  z-index: 5;
  transition: transform 0.9s cubic-bezier(0.77, 0, 0.175, 1);
  box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.5);

  &::after {
    content: "";
    position: absolute;
    top: 0;
    bottom: 0;
    width: 2px;
    background: rgba(255, 255, 255, 0.1);
  }
`;

const DoorLeft = styled.div`
  ${DoorStyles}
  left: 0;
  border-right: 1px solid #141820;
  transform: ${({ $isOpen }) => ($isOpen ? "translateX(-100%)" : "translateX(0)")};

  &::after { right: 0; }
`;

const DoorRight = styled.div`
  ${DoorStyles}
  right: 0;
  border-left: 1px solid #141820;
  transform: ${({ $isOpen }) => ($isOpen ? "translateX(100%)" : "translateX(0)")};

  &::after { left: 0; }
`;


const AccessOverlay = styled.div`
  position: absolute;
  inset: 0;
  z-index: 10;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const KeycardReader = styled.div`
  width: 220px;
  background: #18202c;
  padding: 24px;
  border-radius: 14px;
  border: 1px solid #303c4f;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  cursor: pointer;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.5);
  transition: transform 0.2s ease, border-color 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    border-color: #00f0ff;
  }
`;

const SensorLight = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $isSwiping }) => ($isSwiping ? "#4cd964" : "#ff3b30")};
  box-shadow: 0 0 10px ${({ $isSwiping }) => ($isSwiping ? "#4cd964" : "#ff3b30")};
  transition: all 0.3s ease;
`;

const CardSlot = styled.div`
  width: 140px;
  height: 6px;
  background: #0a0d12;
  border-radius: 3px;
  border-bottom: 1px solid #3a475a;
`;

const SwipePrompt = styled.p`
  margin: 0;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.08em;
  color: #9aaec4;
  text-align: center;
`;

const CardGraphic = styled.div`
  width: 100px;
  height: 60px;
  background: linear-gradient(135deg, #00f0ff, #0066ff);
  border-radius: 6px;
  display: flex;
  align-items: flex-end;
  padding: 8px;
  box-sizing: border-box;

  span {
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 1px;
    color: #000;
  }

  ${({ $isSwiping }) =>
    $isSwiping &&
    css`
      animation: ${swipeMotion} 0.6s ease-in-out infinite;
    `}
`;


const LoginSection = styled.div`
  height: 100%;
  width: 100%;
  padding: 24px;
  box-sizing: border-box;
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  transition: opacity 0.6s ease 0.3s;
  display: flex;
  align-items: center;
`;

const LoginCard = styled.div`
  width: 100%;
`;

const FormHeader = styled.div`
  margin-bottom: 20px;
`;

const SmallText = styled.p`
  margin: 0 0 4px;
  font-size: 11px;
  color: #00f0ff;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-weight: 600;
`;

const FormTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  font-weight: 600;
  color: #ffffff;
`;

const FormDescription = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  color: #7e8e9f;
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 12px;
  color: #aebccb;
`;

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 12px 14px;
  border-radius: 8px;
  border: 1px solid #283342;
  outline: none;
  background: rgba(15, 22, 33, 0.8);
  color: white;
  font-size: 14px;
  transition: all 0.2s ease;

  &::placeholder { color: #485668; }

  &:focus {
    border-color: #00f0ff;
    box-shadow: 0 0 10px rgba(0, 240, 255, 0.2);
    background: rgba(20, 30, 45, 0.9);
  }
`;

const ErrorMessage = styled.div`
  padding: 8px 12px;
  border-radius: 6px;
  background: rgba(255, 59, 48, 0.15);
  border: 1px solid rgba(255, 59, 48, 0.3);
  color: #ff8080;
  font-size: 12px;
`;

const FormOptions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const RememberMe = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
`;

const Checkbox = styled.input`
  accent-color: #00f0ff;
`;

const RememberText = styled.span`
  font-size: 12px;
  color: #7e8e9f;
`;

const ForgotLink = styled(Link)`
  color: #00f0ff;
  font-size: 12px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const ElevatorButton = styled.button`
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #00f0ff 0%, #0072ff 100%);
  color: #000;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
    box-shadow: 0 6px 20px rgba(0, 240, 255, 0.35);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SignupText = styled.p`
  margin: 4px 0 0;
  text-align: center;
  font-size: 12px;
  color: #617285;
`;

const SignupLink = styled(Link)`
  color: #00f0ff;
  text-decoration: none;

  &:hover { text-decoration: underline; }
`;
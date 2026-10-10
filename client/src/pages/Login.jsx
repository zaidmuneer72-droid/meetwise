import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import styled from "styled-components";
import MeetwiseLogo from "../components/MeetwiseLogo";

function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Invalid email or password");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      navigate("/dashboard");
    } catch (err) {
      console.error("Login error:", err);

      setError(
        err instanceof TypeError
          ? "Can't reach the server. Make sure it's running on port 5000."
          : err.message || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Glow aria-hidden="true" />

      <TopBar>
        <Brand to="/">
          <BrandMark>
            <MeetwiseLogo size={27} />
          </BrandMark>
          <BrandName>Meetwise</BrandName>
        </Brand>

        <TopText>
          <TopHint>New here?</TopHint>{" "}
          <InlineLink to="/register">Create account</InlineLink>
        </TopText>
      </TopBar>

      <Main>
        <FormCard>
          <FormTitle>Welcome back</FormTitle>
          <FormDescription>
            Log in to view your meetings, summaries and action items.
          </FormDescription>

          <Form onSubmit={handleSubmit} noValidate>
            <Field>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </Field>

            <Field>
              <LabelRow>
                <Label htmlFor="password">Password</Label>
                <ForgotLink to="/forgot-password">Forgot password?</ForgotLink>
              </LabelRow>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
              />
            </Field>

            {error && <ErrorMessage role="alert">{error}</ErrorMessage>}

            <SubmitButton type="submit" disabled={loading}>
              {loading ? "Logging in..." : "Log in"}
            </SubmitButton>
          </Form>

          <BottomText>
            Don't have an account?{" "}
            <InlineLink to="/register">Create one</InlineLink>
          </BottomText>
        </FormCard>
      </Main>
    </Page>
  );
}

export default Login;

/* ---------- Styles (match Register.jsx) ---------- */

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
    circle at 50% 45%,
    rgba(50, 150, 255, 0.22),
    transparent 45%
  );
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
`;

const BrandName = styled.span`
  font-size: 16px;
  font-weight: 700;
  letter-spacing: 0.01em;
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
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 96px 20px 56px;
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

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Label = styled.label`
  font-size: 13px;
  color: #c4cedb;
`;

const ForgotLink = styled(Link)`
  font-size: 13px;
  font-weight: 600;
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

const Input = styled.input`
  width: 100%;
  padding: 13px 15px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  outline: none;
  background: rgba(255, 255, 255, 0.06);
  color: #ffffff;
  font-size: 14px;
  transition:
    border-color 0.2s ease,
    background 0.2s ease,
    box-shadow 0.2s ease;

  &::placeholder {
    color: #8392a5;
  }

  &:focus {
    border-color: rgba(108, 195, 255, 0.75);
    background: rgba(255, 255, 255, 0.09);
    box-shadow: 0 0 0 3px rgba(80, 170, 255, 0.16);
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

const BottomText = styled.p`
  margin-top: 22px;
  text-align: center;
  font-size: 13px;
  color: #9aa7b8;
`;
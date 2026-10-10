import { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import { MailCheck } from "lucide-react";
import MeetwiseLogo from "../components/MeetwiseLogo";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setMessage("");

    if (!email.trim()) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.message || "Something went wrong.");
      }

      setMessage(data.message);
      setSubmitted(true);
    } catch (error) {
      setError(
        error instanceof TypeError
          ? "Can't reach the server. Make sure it's running."
          : error.message || "Unable to process your request."
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
          <TopHint>Remembered it?</TopHint>{" "}
          <InlineLink to="/login">Log in</InlineLink>
        </TopText>
      </TopBar>

      <Main>
        <FormCard>
          {!submitted ? (
            <>
              <FormTitle>Forgot your password?</FormTitle>
              <FormDescription>
                Enter the email address for your Meetwise account and we'll
                send you a link to reset your password.
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

                {error && <ErrorMessage role="alert">{error}</ErrorMessage>}

                <SubmitButton type="submit" disabled={loading}>
                  {loading ? "Sending..." : "Send reset link"}
                </SubmitButton>
              </Form>

              <BottomText>
                <InlineLink to="/login">← Back to login</InlineLink>
              </BottomText>
            </>
          ) : (
            <>
              <SuccessIcon aria-hidden="true">
                <MailCheck size={26} />
              </SuccessIcon>

              <FormTitle>Check your email</FormTitle>
              <FormDescription role="status">{message}</FormDescription>

              <BottomText>
                <InlineLink to="/login">← Back to login</InlineLink>
              </BottomText>
            </>
          )}
        </FormCard>
      </Main>
    </Page>
  );
};

export default ForgotPassword;

/* ---------- Styles (match Login.jsx and Register.jsx) ---------- */

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

const SuccessIcon = styled.div`
  width: 52px;
  height: 52px;
  margin-bottom: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 14px;
  background: rgba(94, 224, 168, 0.12);
  color: #5ee0a8;
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
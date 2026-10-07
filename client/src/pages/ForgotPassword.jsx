import { useState } from "react";
import { Link } from "react-router-dom";
import styled from "styled-components";
import MeetwiseLogo from "../components/MeetwiseLogo";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

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

      const response = await fetch(
        `${API_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: email.trim(),
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Something went wrong."
        );
      }

      setMessage(data.message);
      setSubmitted(true);
    } catch (error) {
      setError(
        error.message ||
          "Unable to process your request."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Card>
        {!submitted ? (
          <>
            <IconWrapper><MeetwiseLogo size={38} /></IconWrapper>

            <Title>Forgot Password?</Title>

            <Description>
              Enter the email address associated with
              your Meetwise account and we'll send
              you a link to reset your password.
            </Description>

            <Form onSubmit={handleSubmit}>
              <Label htmlFor="email">Email Address</Label>

              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) =>
                  setEmail(e.target.value)
                }
                disabled={loading}
              />

              {error && (
                <ErrorMessage>{error}</ErrorMessage>
              )}

              <SubmitButton
                type="submit"
                disabled={loading}
              >
                {loading
                  ? "Sending..."
                  : "Send Reset Link"}
              </SubmitButton>
            </Form>

            <BackLink to="/login">
              ← Back to Login
            </BackLink>
          </>
        ) : (
          <>
            <IconWrapper><MeetwiseLogo size={38} /></IconWrapper>

            <Title>Check Your Email</Title>

            <Description>
              {message}
            </Description>

            <BackLink to="/login">
              ← Back to Login
            </BackLink>
          </>
        )}
      </Card>
    </Page>
  );
};

export default ForgotPassword;

const Page = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: #f8fafc;
`;

const Card = styled.div`
  width: 100%;
  max-width: 430px;
  padding: 40px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 20px;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.08);
  text-align: center;

  @media (max-width: 480px) {
    padding: 28px 20px;
  }
`;

const IconWrapper = styled.div`
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: #eff6ff;
  font-size: 28px;
`;

const Title = styled.h1`
  margin: 0 0 12px;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
`;

const Description = styled.p`
  margin: 0 auto 28px;
  max-width: 350px;
  color: #6b7280;
  line-height: 1.6;
  font-size: 14px;
`;

const Form = styled.form`
  text-align: left;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #374151;
`;

const Input = styled.input`
  width: 100%;
  box-sizing: border-box;
  padding: 13px 14px;
  border: 1px solid #d1d5db;
  border-radius: 10px;
  outline: none;
  font-size: 14px;
  transition: 0.2s;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  &:disabled {
    background: #f3f4f6;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  margin-top: 18px;
  padding: 13px;
  border: none;
  border-radius: 10px;
  background: #2563eb;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: 0.2s;

  &:hover:not(:disabled) {
    background: #1d4ed8;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  margin: 10px 0 0;
  color: #dc2626;
  font-size: 13px;
`;

const BackLink = styled(Link)`
  display: inline-block;
  margin-top: 24px;
  color: #2563eb;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;
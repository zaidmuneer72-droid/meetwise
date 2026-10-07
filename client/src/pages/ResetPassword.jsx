import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import styled from "styled-components";
import MeetwiseLogo from "../components/MeetwiseLogo";

const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000";

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] =
    useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    if (!password || !confirmPassword) {
      setError("Please fill in both password fields.");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      const response = await fetch(
        `${API_URL}/api/auth/reset-password/${token}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            password,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message ||
            "Unable to reset your password."
        );
      }

      setSuccess(data.message);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      setError(
        error.message ||
          "Unable to reset your password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page>
      <Card>
        <IconWrapper><MeetwiseLogo size={38} /></IconWrapper>

        <Title>Reset Password</Title>

        <Description>
          Create a new password for your Meetwise
          account.
        </Description>

        <Form onSubmit={handleSubmit}>
          <Label htmlFor="password">New Password</Label>

          <Input
            id="password"
            type="password"
            placeholder="Enter new password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            disabled={loading || !!success}
          />

          <Label htmlFor="confirmPassword">Confirm Password</Label>

          <Input
            id="confirmPassword"
            type="password"
            placeholder="Confirm new password"
            value={confirmPassword}
            onChange={(e) =>
              setConfirmPassword(e.target.value)
            }
            disabled={loading || !!success}
          />

          {error && (
            <ErrorMessage>{error}</ErrorMessage>
          )}

          {success && (
            <SuccessMessage>
              {success}
              <br />
              Redirecting to login...
            </SuccessMessage>
          )}

          {!success && (
            <SubmitButton
              type="submit"
              disabled={loading}
            >
              {loading
                ? "Resetting..."
                : "Reset Password"}
            </SubmitButton>
          )}
        </Form>

        {!success && (
          <BackLink to="/login">
            ← Back to Login
          </BackLink>
        )}
      </Card>
    </Page>
  );
};

export default ResetPassword;

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
  text-align: center;
  font-size: 28px;
  font-weight: 700;
  color: #111827;
`;

const Description = styled.p`
  margin: 0 auto 28px;
  max-width: 350px;
  text-align: center;
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
  margin-top: 18px;
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
  margin-top: 24px;
  padding: 13px;
  border: none;
  border-radius: 10px;
  background: #2563eb;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;

  &:hover:not(:disabled) {
    background: #1d4ed8;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.p`
  margin: 12px 0 0;
  color: #dc2626;
  font-size: 13px;
`;

const SuccessMessage = styled.p`
  margin: 18px 0 0;
  padding: 12px;
  border-radius: 8px;
  background: #ecfdf5;
  color: #047857;
  font-size: 13px;
  line-height: 1.5;
`;

const BackLink = styled(Link)`
  display: block;
  margin-top: 24px;
  text-align: center;
  color: #2563eb;
  font-size: 14px;
  font-weight: 600;
  text-decoration: none;

  &:hover {
    text-decoration: underline;
  }
`;
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendPasswordResetEmail = async (email, resetUrl) => {
  await transporter.sendMail({
    from: `"Meetwise" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Meetwise - Reset Your Password",
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1.0" />
          <title>Reset Your Password</title>
        </head>

        <body style="
          margin: 0;
          padding: 0;
          background-color: #f8fafc;
          font-family: Arial, Helvetica, sans-serif;
        ">
          <div style="
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          ">

            <div style="
              background-color: #2563eb;
              padding: 30px;
              text-align: center;
            ">
              <h1 style="
                margin: 0;
                color: #ffffff;
                font-size: 28px;
              ">
                Meetwise
              </h1>
            </div>

            <div style="padding: 35px 30px;">

              <h2 style="
                margin-top: 0;
                color: #111827;
              ">
                Reset your password
              </h2>

              <p style="
                color: #4b5563;
                line-height: 1.6;
                font-size: 15px;
              ">
                We received a request to reset your Meetwise password.
                Click the button below to create a new password.
              </p>

              <div style="
                text-align: center;
                margin: 30px 0;
              ">
                <a
                  href="${resetUrl}"
                  style="
                    display: inline-block;
                    background-color: #2563eb;
                    color: #ffffff;
                    text-decoration: none;
                    padding: 14px 28px;
                    border-radius: 8px;
                    font-weight: bold;
                    font-size: 15px;
                  "
                >
                  Reset Password
                </a>
              </div>

              <p style="
                color: #6b7280;
                line-height: 1.6;
                font-size: 14px;
              ">
                This link will expire in 15 minutes.
              </p>

              <p style="
                color: #6b7280;
                line-height: 1.6;
                font-size: 14px;
              ">
                If you did not request a password reset, you can safely
                ignore this email.
              </p>

              <hr style="
                border: none;
                border-top: 1px solid #e5e7eb;
                margin: 30px 0;
              " />

              <p style="
                color: #9ca3af;
                font-size: 12px;
                line-height: 1.5;
              ">
                For security reasons, this link can only be used once.
              </p>

            </div>
          </div>
        </body>
      </html>
    `,
  });
};

module.exports = {
  sendPasswordResetEmail,
};
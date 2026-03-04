import smtplib
import logging
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.config import settings

logger = logging.getLogger(__name__)


def send_verification_email(to_email: str, code: str) -> None:
    """Send OTP verification email via SMTP TLS."""
    subject = "Your Decision-Q verification code"
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8" />
      <style>
        body {{ font-family: 'Inter', Arial, sans-serif; background: #f0f2f5; margin: 0; padding: 40px 0; }}
        .card {{
          background: #ffffff; max-width: 480px; margin: 0 auto;
          border-radius: 20px; overflow: hidden;
          box-shadow: 0 8px 40px rgba(15,30,54,0.12);
        }}
        .header {{
          background: #0f1e36; padding: 32px 40px;
          display: flex; align-items: center; gap: 12px;
        }}
        .logo-mark {{
          width: 36px; height: 36px; background: #7da87b;
          border-radius: 9px; display: inline-flex;
          align-items: center; justify-content: center;
          font-size: 18px; font-weight: 800; color: #fff;
          text-align: center; line-height: 36px;
        }}
        .logo-text {{ color: #ffffff; font-size: 18px; font-weight: 700; margin-left: 10px; }}
        .body {{ padding: 40px; }}
        h2 {{ color: #0f1e36; font-size: 22px; margin: 0 0 8px; }}
        p {{ color: #5a7189; font-size: 15px; line-height: 1.6; margin: 0 0 24px; }}
        .otp-box {{
          background: #f0f2f5; border-radius: 14px;
          padding: 24px; text-align: center; margin-bottom: 24px;
        }}
        .otp {{ font-size: 40px; font-weight: 800; letter-spacing: 14px; color: #0f1e36; }}
        .expiry {{ font-size: 13px; color: #8a9bb0; margin-top: 8px; }}
        .footer {{ padding: 0 40px 32px; font-size: 12px; color: #8a9bb0; }}
      </style>
    </head>
    <body>
      <div class="card">
        <div class="header">
          <span class="logo-mark">Q</span>
          <span class="logo-text">Decision</span>
        </div>
        <div class="body">
          <h2>Verify your email</h2>
          <p>Enter the code below to activate your account. It expires in <strong>10 minutes</strong>.</p>
          <div class="otp-box">
            <div class="otp">{code}</div>
            <div class="expiry">Valid for 10 minutes</div>
          </div>
          <p>If you didn't request this, you can safely ignore this email.</p>
        </div>
        <div class="footer">
          &copy; 2026 Decision-Q &mdash; Make better decisions in under 5 minutes.
        </div>
      </div>
    </body>
    </html>
    """

    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>"
    msg["To"] = to_email
    msg.attach(MIMEText(html_body, "html"))

    try:
        with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
            server.ehlo()
            server.starttls()
            server.ehlo()
            server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
            server.sendmail(settings.EMAIL_FROM, to_email, msg.as_string())

        logger.info(f"Verification email sent to {to_email}")
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {e}")
        # In development, fall back to console log
        if settings.ENVIRONMENT == "development":
            logger.warning(f"[DEV FALLBACK] OTP for {to_email}: {code}")
        else:
            raise

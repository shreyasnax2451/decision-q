import smtplib
import logging
import sendgrid
from sendgrid.helpers.mail import Mail as SGMail, Email as SGEmail, To as SGTo, Content as SGContent
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from app.config import settings
from app.services.email_templates import get_verification_email_html

logger = logging.getLogger(__name__)


def send_verification_email(to_email: str, code: str) -> None:
    """Send OTP verification email via SendGrid, or SMTP."""
    subject = "Your Decision-Q verification code"
    html_body = get_verification_email_html(code)

    # --- Choice 1: SendGrid API ---
    if settings.SENDGRID_API_KEY:
        try:
            sg = sendgrid.SendGridAPIClient(api_key=settings.SENDGRID_API_KEY)
            message = SGMail(
                from_email=SGEmail(settings.EMAIL_FROM, settings.EMAIL_FROM_NAME),
                to_emails=SGTo(to_email),
                subject=subject,
                html_content=SGContent("text/html", html_body)
            )
            sg.send(message)
            logger.info(f"Code: {code}")
            logger.info(f"Email sent via SendGrid API to {to_email}")
            return
        except Exception as e:
            logger.error(f"SendGrid API failed: {e}")
            if settings.ENVIRONMENT != "development":
                raise

    else:
        # --- Choice 2: SMTP ---
        logger.warning("No Email API (SendGrid) configured. Falling back to SMTP.")
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"{settings.EMAIL_FROM_NAME} <{settings.EMAIL_FROM}>"
        msg["To"] = to_email
        msg.attach(MIMEText(html_body, "html"))

        try:
            if settings.SMTP_PORT == 465:
                with smtplib.SMTP_SSL(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    server.sendmail(settings.EMAIL_FROM, to_email, msg.as_string())
            else:
                with smtplib.SMTP(settings.SMTP_HOST, settings.SMTP_PORT) as server:
                    server.ehlo()
                    server.starttls()
                    server.ehlo()
                    server.login(settings.SMTP_USER, settings.SMTP_PASSWORD)
                    server.sendmail(settings.EMAIL_FROM, to_email, msg.as_string())

            logger.info(f"Email sent via SMTP to {to_email}")
        except Exception as e:
            logger.error(f"SMTP failed to {to_email}: {e}")
            if settings.ENVIRONMENT == "development":
                logger.warning(f"[DEV FALLBACK] OTP for {to_email}: {code}")
            else:
                raise

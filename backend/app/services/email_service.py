import smtplib
from email.message import EmailMessage

from app.core.config import settings


def send_email(*, to_email: str, subject: str, body: str) -> None:
    if not settings.smtp_host or not settings.smtp_user or not settings.smtp_password:
        raise ValueError("SMTP settings are not configured")

    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
    msg["To"] = to_email
    msg.set_content(body)

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=10) as server:
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)

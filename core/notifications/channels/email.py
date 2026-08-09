from pathlib import Path

import aiosmtplib
from jinja2 import Environment, FileSystemLoader, select_autoescape
from email.message import EmailMessage
from core.notifications.base import Mail
from core.logging import get_logger

logger = get_logger(__name__)


class EmailChannel:
    def __init__(
        self,
        *,
        host: str,
        port: int,
        username: str,
        password: str,
        sender: str,
        template_dir: str | Path,
        start_tls: bool = True,
    ):
        self.host = host
        self.port = port
        self.username = username
        self.password = password
        self.sender = sender
        self.start_tls = start_tls

        self.templates = Environment(
            loader=FileSystemLoader(str(template_dir)),
            autoescape=select_autoescape(["html", "xml"]),
        )

    async def send(self, mail: Mail) -> None:
        template = self.templates.get_template(mail.template)
        html = template.render(**mail.data)

        message = EmailMessage()

        message["From"] = self.sender
        message["To"] = mail.to
        message["Subject"] = mail.subject

        message.set_content(
            "This email requires an HTML-compatible email client."
        )

        message.add_alternative(
            html,
            subtype="html",
        )

        if mail.to.lower().endswith("@guest.com"):
            logger.debug("Skipping email send to guest.com address: %s", mail.to)
            return

        await aiosmtplib.send(
            message,
            hostname=self.host,
            port=self.port,
            username=self.username,
            password=self.password,
            start_tls=self.start_tls,
        )
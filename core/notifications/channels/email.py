from core.notifications.filters import normalize_image
from core.notifications.filters import format_naira
from core.notifications.filters import format_date
from pathlib import Path

import aiosmtplib
from jinja2 import Environment, FileSystemLoader, select_autoescape
from core.notifications.filters import discount
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

        self.templates.filters.update({
            "date": format_date,
            "discount": discount,
            "naira": format_naira,
            "normalize_image": normalize_image,
        })

    async def send(self, mail: Mail) -> None:
        template = self.templates.get_template(mail.template)
        html = template.render(**mail.data)

        message = EmailMessage()

        message["From"] = self.sender
        message["To"] = mail.to
        message["Subject"] = mail.subject

        if mail.cc:
            cc_list = mail.cc if isinstance(mail.cc, list) else [mail.cc]
            message["Cc"] = ", ".join(cc_list)

        message.set_content(
            "This email requires an HTML-compatible email client."
        )

        message.add_alternative(html, subtype="html")

        if mail.to.lower().endswith("@guest.com"):
            logger.debug("Skipping email send to guest.com address: %s", mail.to)
            return

        kwargs = dict(
            hostname=self.host,
            port=self.port,
            start_tls=self.start_tls,
        )

        if self.username and self.password:
            kwargs["username"] = self.username
            kwargs["password"] = self.password

        res = await aiosmtplib.send(message, **kwargs)

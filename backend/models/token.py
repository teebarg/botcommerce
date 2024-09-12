from sqlmodel import SQLModel


# Contents of JWT token
class TokenPayload(SQLModel):
    sub: str | None = None

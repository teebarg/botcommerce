from pydantic import BaseModel

# Contents of JWT token
class TokenPayload(BaseModel):
    sub: str | None = None

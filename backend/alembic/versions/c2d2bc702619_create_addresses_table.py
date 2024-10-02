"""create addresses table

Revision ID: c2d2bc702619
Revises: 8793283478de
Create Date: 2024-10-02 13:47:45.611039

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel.sql.sqltypes


# revision identifiers, used by Alembic.
revision: str = 'c2d2bc702619'
down_revision: Union[str, None] = '8793283478de'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    pass


def downgrade() -> None:
    pass

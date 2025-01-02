"""create addresses table

Revision ID: c2d2bc702619
Revises: 8793283478de
Create Date: 2024-10-02 13:47:45.611039

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c2d2bc702619"
down_revision: Union[str, None] = "8793283478de"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "addresses",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=False),
        sa.Column("firstname", sa.String(length=255), nullable=True),
        sa.Column("lastname", sa.String(length=255), nullable=True),
        sa.Column("address_1", sa.String(length=1255), nullable=False),
        sa.Column("address_2", sa.String(length=1255), nullable=True),
        sa.Column("city", sa.String(length=255), nullable=False),
        sa.Column("postal_code", sa.String(length=255), nullable=True),
        sa.Column("state", sa.String(length=255), nullable=True),
        sa.Column("phone", sa.String(length=255), nullable=True),
        sa.Column("is_billing", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["user.id"],
        ),
        sa.PrimaryKeyConstraint("id"),
    )


def downgrade() -> None:
    op.drop_table("addresses")

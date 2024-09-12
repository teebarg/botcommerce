"""create cart table

Revision ID: dc410d334e03
Revises: 89b489aafe89
Create Date: 2024-07-23 10:55:56.643782

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "dc410d334e03"
down_revision: Union[str, None] = "89b489aafe89"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "cart",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("session_id", sa.String(length=255), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["user.id"],
        ),
    )
    op.create_index(op.f("ix_user_session"), "cart", ["session_id"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_user_session"), table_name="cart")
    op.drop_table("cart")

"""create brands table

Revision ID: bb9f18cd94c4
Revises: bbf1cae5bad7
Create Date: 2024-07-08 14:26:09.739769

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "bb9f18cd94c4"
down_revision: Union[str, None] = "bbf1cae5bad7"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "brand",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False, unique=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_brand_name"), "brand", ["name"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_brand_name"), table_name="brand")
    op.drop_table("brand")

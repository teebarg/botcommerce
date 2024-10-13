"""create product categories table

Revision ID: c80c4f5551a2
Revises: 309221ea6570
Create Date: 2024-10-13 08:09:21.208657

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = 'c80c4f5551a2'
down_revision: Union[str, None] = '309221ea6570'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "product_categories",
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("category_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["product_id"],
            ["product.id"],
        ),
        sa.ForeignKeyConstraint(
            ["category_id"],
            ["categories.id"],
        ),
    )


def downgrade() -> None:
    op.drop_table("product_categories")

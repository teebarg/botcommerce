"""create product brand table

Revision ID: fede65d66133
Revises: 16a2a7ec3c5a
Create Date: 2025-01-08 17:40:35.040558

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'fede65d66133'
down_revision: Union[str, None] = '16a2a7ec3c5a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "productbrand",
        sa.Column("product_id", sa.Integer(), nullable=False),
        sa.Column("brand_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["product_id"],
            ["product.id"],
        ),
        sa.ForeignKeyConstraint(
            ["brand_id"],
            ["brand.id"],
        ),
    )


def downgrade() -> None:
    op.drop_table("productbrand")

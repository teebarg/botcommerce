"""create product_brands table

Revision ID: 512b1394bb3d
Revises: 202114576772
Create Date: 2024-07-08 14:32:57.910119

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "512b1394bb3d"
down_revision: Union[str, None] = "202114576772"
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

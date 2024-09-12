"""create products table

Revision ID: 3373971ee397
Revises: bb9f18cd94c4
Create Date: 2024-07-08 14:30:53.215539

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "3373971ee397"
down_revision: Union[str, None] = "bb9f18cd94c4"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table(
        "product",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False, unique=True),
        sa.Column("description", sa.Text(), nullable=True),
        sa.Column("price", sa.Float(), nullable=False, default=0),
        sa.Column("old_price", sa.Float(), nullable=False, default=0),
        sa.Column("inventory", sa.Integer(), nullable=False, default=0),
        sa.Column("image", sa.String(length=255), nullable=True),
        sa.Column("is_active", sa.Boolean(), nullable=False, default=True),
        sa.Column("ratings", sa.Float(), default=0),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_product_name"), "product", ["name"], unique=True)
    # ### end Alembic commands ###


def downgrade() -> None:
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_index(op.f("ix_product_name"), table_name="product")
    op.drop_table("product")
    # ### end Alembic commands ###

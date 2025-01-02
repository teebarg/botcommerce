"""create collections table

Revision ID: eb8356a7b408
Revises: 9c0a54914c78
Create Date: 2024-07-08 14:24:17.549389

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "eb8356a7b408"
down_revision: Union[str, None] = "9c0a54914c78"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "collection",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False, unique=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_collection_name"), "collection", ["name"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_collection_name"), table_name="collection")
    op.drop_table("collection")

"""create tags table

Revision ID: bbf1cae5bad7
Revises: eb8356a7b408
Create Date: 2024-07-08 14:25:37.485546

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "bbf1cae5bad7"
down_revision: Union[str, None] = "eb8356a7b408"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "tag",
        sa.Column("id", sa.Integer(), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("slug", sa.String(length=255), nullable=False, unique=True),
        sa.Column("is_active", sa.Boolean(), nullable=False),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.Column("updated_at", sa.DateTime(), nullable=True),
        sa.PrimaryKeyConstraint("id"),
    )
    op.create_index(op.f("ix_tag_name"), "tag", ["name"], unique=True)


def downgrade() -> None:
    op.drop_index(op.f("ix_tag_name"), table_name="tag")
    op.drop_table("tag")

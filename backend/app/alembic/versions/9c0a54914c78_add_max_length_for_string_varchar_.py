"""Add max length for string(varchar) fields in User and Items models

Revision ID: 9c0a54914c78
Revises: 6408efd24b89
Create Date: 2024-06-22 14:42:44.639457

"""

import sqlalchemy as sa

from alembic import op

# revision identifiers, used by Alembic.
revision = "9c0a54914c78"
down_revision = "6408efd24b89"
branch_labels = None
depends_on = None


def upgrade():
    # Adjust the length of the email field in the User table
    op.alter_column(
        "user",
        "email",
        existing_type=sa.String(),
        type_=sa.String(length=255),
        existing_nullable=False,
    )


def downgrade():
    # Revert the length of the email field in the User table
    op.alter_column(
        "user",
        "email",
        existing_type=sa.String(length=255),
        type_=sa.String(),
        existing_nullable=False,
    )

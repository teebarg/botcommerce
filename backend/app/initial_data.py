from sqlmodel import Session

from app.core.logging import logger
from app.db.engine import engine
from app.db.init_db import init_db


def init() -> None:
    with Session(engine) as session:
        init_db(session)


def main() -> None:
    logger.info("Creating initial data")
    init()
    logger.info("Initial data created")


if __name__ == "__main__":
    main()

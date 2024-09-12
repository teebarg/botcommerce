import logging
import logging.config

# Dictionary to configure logging
LOGGING_CONFIG = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "standard": {
            "format": "%(asctime)s [%(levelname)s] %(name)s: %(funcName)s(): %(message)s"
        },
    },
    "handlers": {
        "console": {
            "level": "DEBUG",
            "formatter": "standard",
            "class": "logging.StreamHandler",
        },
    },
    "loggers": {
        "": {  # root logger
            "handlers": ["console"],
            "level": "DEBUG",
            "propagate": True,
        },
    },
}

# Apply the logging configuration
logging.config.dictConfig(LOGGING_CONFIG)

# Use the logger in your application
logger = logging.getLogger(__name__)

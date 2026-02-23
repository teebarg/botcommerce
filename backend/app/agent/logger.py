import logging
logger = logging.getLogger("agent_logger")
logger.setLevel(logging.INFO)
handler = logging.FileHandler("agent_interactions.log")
formatter = logging.Formatter("%(asctime)s | %(session_id)s | %(user)s | %(message)s | %(response)s | %(confidence)s")
handler.setFormatter(formatter)
logger.addHandler(handler)

def log_interaction(session_id, user_message, response, confidence=None):
    logger.info("", extra={
        "session_id": session_id,
        "user": user_message,
        "message": user_message,
        "response": response,
        "confidence": confidence
    })
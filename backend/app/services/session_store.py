import time
from typing import Dict

class SessionStore:
    def __init__(self):
        self.sessions: Dict[str, Dict] = {}

    def set(self, key: str, mapping: Dict):
        self.sessions[key] = mapping

    def get_all_with_prefix(self, prefix: str) -> Dict[str, Dict]:
        return {
            key: val for key, val in self.sessions.items()
            if key.startswith(prefix)
        }

    def update_field(self, key: str, field: str, value: str):
        if key in self.sessions:
            self.sessions[key][field] = value

    def delete(self, key: str):
        self.sessions.pop(key, None)


session_store = SessionStore()

from typing import List
from google.oauth2 import service_account
from googleapiclient.discovery import build
import logging
import os

logger = logging.getLogger(__name__)

class GoogleSheetReader:
    def __init__(self, credentials_path: str, scopes: List[str] = None):
        if scopes is None:
            scopes = ["https://www.googleapis.com/auth/spreadsheets.readonly"]

        if not os.path.exists(credentials_path):
            raise FileNotFoundError(f"Service account file not found at {credentials_path}")

        self.credentials = service_account.Credentials.from_service_account_file(
            credentials_path, scopes=scopes
        )
        self.service = build("sheets", "v4", credentials=self.credentials)

    def read_sheet(self, spreadsheet_id: str, range_: str) -> List[List[str]]:
        try:
            sheet = self.service.spreadsheets()
            result = sheet.values().get(spreadsheetId=spreadsheet_id, range=range_).execute()
            values = result.get("values", [])
            logger.info(f"Read {len(values)} rows from Google Sheet {spreadsheet_id}")
            return values
        except Exception as e:
            logger.error(f"Failed to read Google Sheet: {e}")
            raise

import os
from datetime import datetime
from uuid import uuid4

try:
    from supabase import create_client
except ImportError:
    create_client = None

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("SUPABASE_SERVICE_ROLE_KEY", "")


class SurveyStorage:
    def __init__(self):
        self.local_surveys = []
        self.use_supabase = bool(SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY and create_client)
        self.client = None

        if self.use_supabase:
            self.client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    def create_survey(self, payload):
        user_id = str(uuid4())
        record = {
            "id": user_id,
            "created_at": datetime.utcnow().isoformat(),
            **payload,
        }

        if self.client:
            self.client.table("surveys").insert(record).execute()
        else:
            self.local_surveys.append(record)

        return record

    def list_surveys(self):
        if self.client:
            response = self.client.table("surveys").select("*").order("created_at", desc=True).limit(200).execute()
            return response.data or []
        return list(self.local_surveys)

from app.celery_app import app
import time

@app.task(name="test_stream", bind=True, max_retries=3)
def test_stream(self):
    for i in range(10):
        self.update_state(state="PROGRESS", meta={"progress": i * 10})
        time.sleep(1)
    return "Done"
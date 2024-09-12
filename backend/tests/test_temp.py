from fastapi.testclient import TestClient


class Test:
    def test_template(self, client: TestClient):
        response = client.get("/api/no-exists")
        assert response.status_code == 404

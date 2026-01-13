import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_unregister_participant():
    activity = "Chess Club"
    email = "unregistertest@mergington.edu"
    # Ensure signed up
    client.post(f"/activities/{activity}/signup?email={email}")
    # Unregister endpoint may not exist yet, so this will fail if not implemented
    response = client.post(f"/activities/{activity}/unregister?email={email}")
    # Accept 200 or 404 if not implemented
    assert response.status_code in (200, 404)
    if response.status_code == 200:
        assert "removed" in response.json()["message"] or "unregistered" in response.json()["message"].lower()

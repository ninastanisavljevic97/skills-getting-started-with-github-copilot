import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, dict)
    assert "Chess Club" in data
    assert "participants" in data["Chess Club"]

def test_signup_success():
    email = "testuser@mergington.edu"
    activity = "Chess Club"
    # Remove if already present using the unregister endpoint
    client.post(f"/activities/{activity}/unregister?email={email}")
    # Try to sign up
    response = client.post(f"/activities/{activity}/signup?email={email}")
    if response.status_code == 400:
        # Already signed up, try to unregister and sign up again
        client.post(f"/activities/{activity}/unregister?email={email}")
        response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 200
    assert f"Signed up {email} for {activity}" in response.json()["message"]

def test_signup_duplicate():
    email = "testuser2@mergington.edu"
    activity = "Chess Club"
    # Ensure signed up
    client.post(f"/activities/{activity}/signup?email={email}")
    # Try duplicate
    response = client.post(f"/activities/{activity}/signup?email={email}")
    assert response.status_code == 400
    assert "already signed up" in response.json()["detail"]

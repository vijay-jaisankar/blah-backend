from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

"""
    Test the `base` API route
"""
def test_get_status():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"status": "up ✓"}

"""
    Test the `get details` route
"""
def test_get_details():
    # Positive case
    response_positive = client.get("/details/tt3896198")
    assert response_positive.status_code == 200

    # Negative case
    response_negative = client.get("/detais/invalid")
    assert response_negative.status_code == 404

"""
    Test the `check validity` route
"""
def test_check_valid():
    # Positive case
    response_positive = client.get("/valid/tt3896198")
    assert response_positive.status_code == 200
    assert response_positive.json() == {"message": "valid"}

    # Negative case
    response_negative = client.get("/valid/invalid")
    assert response_negative.status_code == 404
    assert response_negative.json() == {"message": "invalid"}

"""
    Vacuously test the `feed` route
"""
def test_get_feed():
    response = client.get("/feed")
    assert response.status_code == 200
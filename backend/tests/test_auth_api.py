def test_register_and_login_flow(client_public):
    register_payload = {
        "name": "New User",
        "email": "newuser@example.com",
        "password": "Password123",
        "role": "student",
    }
    register_response = client_public.post("/api/v1/auth/register", json=register_payload)
    assert register_response.status_code == 200
    data = register_response.json()
    assert data["email"] == register_payload["email"]

    login_response = client_public.post(
        "/api/v1/auth/login",
        json={"email": register_payload["email"], "password": register_payload["password"]},
    )
    assert login_response.status_code == 200
    token_data = login_response.json()
    assert "access_token" in token_data


def test_login_invalid_credentials(client_public):
    response = client_public.post(
        "/api/v1/auth/login",
        json={"email": "missing@example.com", "password": "wrong"},
    )
    assert response.status_code == 401


def test_me_endpoint_returns_current_user(client_teacher):
    response = client_teacher.get("/api/v1/auth/me")
    assert response.status_code == 200
    assert response.json()["role"] == "teacher"

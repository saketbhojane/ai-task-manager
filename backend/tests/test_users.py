import pytest


class TestUserEndpoints:
    """Tests for User API endpoints."""

    def test_create_user(self, client):
        """Test creating a new user."""
        response = client.post(
            "/api/users",
            json={"email": "test@example.com", "name": "Test User"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "test@example.com"
        assert data["name"] == "Test User"
        assert "id" in data
        assert "created_at" in data

    def test_create_user_duplicate_email(self, client):
        """Test creating a user with duplicate email fails."""
        user_data = {"email": "duplicate@example.com", "name": "User 1"}
        client.post("/api/users", json=user_data)

        response = client.post(
            "/api/users",
            json={"email": "duplicate@example.com", "name": "User 2"},
        )
        assert response.status_code == 400
        assert "already exists" in response.json()["detail"]

    def test_create_user_invalid_email(self, client):
        """Test creating a user with invalid email fails."""
        response = client.post(
            "/api/users",
            json={"email": "invalid-email", "name": "Test User"},
        )
        assert response.status_code == 422

    def test_list_users(self, client):
        """Test listing all users."""
        # Create some users
        client.post("/api/users", json={"email": "user1@example.com", "name": "User 1"})
        client.post("/api/users", json={"email": "user2@example.com", "name": "User 2"})

        response = client.get("/api/users")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

    def test_list_users_pagination(self, client):
        """Test listing users with pagination."""
        # Create some users
        for i in range(5):
            client.post("/api/users", json={"email": f"user{i}@example.com", "name": f"User {i}"})

        response = client.get("/api/users?skip=2&limit=2")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

    def test_get_user(self, client):
        """Test getting a single user."""
        # Create a user
        create_response = client.post(
            "/api/users",
            json={"email": "test@example.com", "name": "Test User"},
        )
        user_id = create_response.json()["id"]

        response = client.get(f"/api/users/{user_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == user_id
        assert data["email"] == "test@example.com"

    def test_get_user_not_found(self, client):
        """Test getting a non-existent user returns 404."""
        response = client.get("/api/users/999")
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()

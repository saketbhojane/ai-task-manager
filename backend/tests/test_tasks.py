import pytest


class TestTaskEndpoints:
    """Tests for Task API endpoints."""

    def test_create_task(self, client):
        """Test creating a new task."""
        response = client.post(
            "/api/tasks",
            json={"title": "Test Task", "description": "Test Description"},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["title"] == "Test Task"
        assert data["description"] == "Test Description"
        assert data["status"] == "todo"
        assert data["priority"] == "medium"
        assert "id" in data
        assert "created_at" in data
        assert "updated_at" in data

    def test_create_task_with_status_and_priority(self, client):
        """Test creating a task with custom status and priority."""
        response = client.post(
            "/api/tasks",
            json={
                "title": "Urgent Task",
                "status": "in_progress",
                "priority": "high",
            },
        )
        assert response.status_code == 201
        data = response.json()
        assert data["status"] == "in_progress"
        assert data["priority"] == "high"

    def test_create_task_with_assignee(self, client):
        """Test creating a task with an assignee."""
        # Create a user first
        user_response = client.post(
            "/api/users",
            json={"email": "assignee@example.com", "name": "Assignee"},
        )
        user_id = user_response.json()["id"]

        response = client.post(
            "/api/tasks",
            json={"title": "Assigned Task", "assignee_id": user_id},
        )
        assert response.status_code == 201
        data = response.json()
        assert data["assignee_id"] == user_id

    def test_create_task_empty_title(self, client):
        """Test creating a task with empty title fails."""
        response = client.post(
            "/api/tasks",
            json={"title": ""},
        )
        assert response.status_code == 422

    def test_list_tasks(self, client):
        """Test listing all tasks."""
        client.post("/api/tasks", json={"title": "Task 1"})
        client.post("/api/tasks", json={"title": "Task 2"})

        response = client.get("/api/tasks")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 2

    def test_list_tasks_filter_by_status(self, client):
        """Test filtering tasks by status."""
        client.post("/api/tasks", json={"title": "Todo Task", "status": "todo"})
        client.post("/api/tasks", json={"title": "Done Task", "status": "done"})

        response = client.get("/api/tasks?status=todo")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["status"] == "todo"

    def test_list_tasks_filter_by_priority(self, client):
        """Test filtering tasks by priority."""
        client.post("/api/tasks", json={"title": "High Priority", "priority": "high"})
        client.post("/api/tasks", json={"title": "Low Priority", "priority": "low"})

        response = client.get("/api/tasks?priority=high")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["priority"] == "high"

    def test_list_tasks_filter_by_assignee(self, client):
        """Test filtering tasks by assignee."""
        # Create a user
        user_response = client.post(
            "/api/users",
            json={"email": "user@example.com", "name": "User"},
        )
        user_id = user_response.json()["id"]

        client.post("/api/tasks", json={"title": "Assigned", "assignee_id": user_id})
        client.post("/api/tasks", json={"title": "Unassigned"})

        response = client.get(f"/api/tasks?assignee_id={user_id}")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["assignee_id"] == user_id

    def test_get_task(self, client):
        """Test getting a single task."""
        create_response = client.post(
            "/api/tasks",
            json={"title": "Test Task"},
        )
        task_id = create_response.json()["id"]

        response = client.get(f"/api/tasks/{task_id}")
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == task_id
        assert data["title"] == "Test Task"

    def test_get_task_not_found(self, client):
        """Test getting a non-existent task returns 404."""
        response = client.get("/api/tasks/999")
        assert response.status_code == 404

    def test_update_task(self, client):
        """Test updating a task."""
        create_response = client.post(
            "/api/tasks",
            json={"title": "Original Title"},
        )
        task_id = create_response.json()["id"]

        response = client.put(
            f"/api/tasks/{task_id}",
            json={"title": "Updated Title", "status": "done"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Title"
        assert data["status"] == "done"

    def test_update_task_partial(self, client):
        """Test partial update of a task."""
        create_response = client.post(
            "/api/tasks",
            json={"title": "Task", "description": "Original Description"},
        )
        task_id = create_response.json()["id"]

        # Update only status
        response = client.put(
            f"/api/tasks/{task_id}",
            json={"status": "in_progress"},
        )
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Task"
        assert data["description"] == "Original Description"
        assert data["status"] == "in_progress"

    def test_update_task_not_found(self, client):
        """Test updating a non-existent task returns 404."""
        response = client.put(
            "/api/tasks/999",
            json={"title": "Updated"},
        )
        assert response.status_code == 404

    def test_delete_task(self, client):
        """Test deleting a task."""
        create_response = client.post(
            "/api/tasks",
            json={"title": "To Delete"},
        )
        task_id = create_response.json()["id"]

        response = client.delete(f"/api/tasks/{task_id}")
        assert response.status_code == 204

        # Verify task is deleted
        get_response = client.get(f"/api/tasks/{task_id}")
        assert get_response.status_code == 404

    def test_delete_task_not_found(self, client):
        """Test deleting a non-existent task returns 404."""
        response = client.delete("/api/tasks/999")
        assert response.status_code == 404

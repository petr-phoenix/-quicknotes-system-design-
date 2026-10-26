# QuickNotes REST API Design Specification

## Endpoints

| Method | Path | Description | Success Status |
|---|---|---|---|
| `GET` | `/api/v1/notes` | List notes for authenticated user | `200 OK` |
| `POST` | `/api/v1/notes` | Create a new note | `201 Created` |
| `GET` | `/api/v1/notes/:id` | Fetch single note by ID | `200 OK` |
| `PUT` | `/api/v1/notes/:id` | Replace note entirely | `200 OK` |
| `PATCH` | `/api/v1/notes/:id` | Partially update note fields | `200 OK` |
| `DELETE` | `/api/v1/notes/:id` | Delete note by ID | `204 No Content` |

---

## JSON Payload Examples

### 1. Create Note (`POST /api/v1/notes`)

**Request:**
```json
{
  "title": "System Architecture Review",
  "body": "Analyze load balancer topology and database read replica strategy.",
  "tag_ids": [1, 4]
}

{
  "id": 204,
  "user_id": 12,
  "title": "System Architecture Review",
  "body": "Analyze load balancer topology and database read replica strategy.",
  "tags": [
    { "id": 1, "name": "Work" },
    { "id": 4, "name": "Architecture" }
  ],
  "created_at": "2026-10-18T20:00:00Z",
  "updated_at": "2026-10-18T20:00:00Z"
}
{
  "data": [
    {
      "id": 204,
      "user_id": 12,
      "title": "System Architecture Review",
      "body": "Analyze load balancer topology and database read replica strategy.",
      "tags": ["Work", "Architecture"],
      "created_at": "2026-10-18T20:00:00Z",
      "updated_at": "2026-10-18T20:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total_items": 1,
    "total_pages": 1
  }
}  
{
  "error": {
    "code": "INVALID_INPUT",
    "status": 400,
    "message": "Validation failed on submitted payload.",
    "details": [
      {
        "field": "title",
        "issue": "Title is required and must not exceed 100 characters."
      }
    ],
    "timestamp": "2026-10-18T20:05:00Z"
  }
}
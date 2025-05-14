# User Search API

## Endpoint

`GET /api/search/users/`

## Description

This endpoint allows searching and filtering users in the neighborhood assistance system.

## Authentication

Authentication is required for this endpoint. Users must be logged in to search for other users.

## Query Parameters

| Parameter  | Description                                                      | Example             |
| ---------- | ---------------------------------------------------------------- | ------------------- |
| search     | General search across name, surname, username, location          | `?search=john`      |
| name       | Filter users by name (case-insensitive, partial match)           | `?name=john`        |
| surname    | Filter users by surname (case-insensitive, partial match)        | `?surname=doe`      |
| username   | Filter users by username (case-insensitive, partial match)       | `?username=john123` |
| location   | Filter users by location (case-insensitive, partial match)       | `?location=chicago` |
| rating_min | Filter users with rating greater than or equal to value          | `?rating_min=4.0`   |
| rating_max | Filter users with rating less than or equal to value             | `?rating_max=5.0`   |
| ordering   | Order results by specified fields (prefix with - for descending) | `?ordering=-rating` |

Multiple parameters can be combined to refine the search further:
`?name=john&rating_min=4.0&ordering=-rating`

## Response Format

```json
{
  "status": "success",
  "message": "Users retrieved successfully.",
  "data": {
    "count": 10,
    "next": "http://example.com/api/search/users/?page=2",
    "previous": null,
    "results": [
      {
        "id": 1,
        "name": "John",
        "surname": "Doe",
        "username": "johndoe",
        "email": "john.doe@example.com",
        "phone_number": "1234567890",
        "location": "New York",
        "rating": 4.5,
        "completed_task_count": 12,
        "is_active": true
      }
      // Additional users...
    ]
  }
}
```

## Error Responses

### 401 Unauthorized

If the request is made without valid authentication:

```json
{
  "detail": "Authentication credentials were not provided."
}
```

### 400 Bad Request

If there are invalid query parameters:

```json
{
  "status": "error",
  "message": "Invalid rating value.",
  "errors": {
    "rating_min": ["Enter a valid number."]
  }
}
```

## Usage Examples

1. **Search for users with "smith" in their name or surname:**
   `GET /api/search/users/?search=smith`

2. **Find all users in Chicago:**
   `GET /api/search/users/?location=chicago`

3. **Find users named "John" with a rating of at least 4.0:**
   `GET /api/search/users/?name=john&rating_min=4.0`

4. **Get users ordered by their rating (highest first):**
   `GET /api/search/users/?ordering=-rating`

5. **Find users with "helper" in their username and sort by number of completed tasks:**
   `GET /api/search/users/?username=helper&ordering=-completed_task_count`

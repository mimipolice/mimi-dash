# Announcements & Banners API Documentation

This document outlines the API endpoints for managing and retrieving **Announcements** and **Banners**. The backend implementation uses Markdown files with YAML frontmatter as the data source.

## Core Concepts

- **Announcements**: General-purpose announcements displayed on the `/announcements` page. They contain full-length content.
  - **Storage**: Each announcement is a `.md` file in `src/announcements/`.
- **Banners**: Special announcements designed to be displayed on the dashboard UI. They are concise and can be scheduled.
  - **Storage**: Each banner is a `.md` file in `src/banners/`.
- **Authentication**: All write operations (POST, PUT, DELETE) for both systems require administrator privileges.
- **Standard Response Format**:
  - **Success**: The requested JSON data (object or array) is returned directly.
  - **Error**: `{ "error": "Error message" }` with an appropriate HTTP status code.

---

## Announcements API

### 1. Get All Announcements (Public)

Retrieves a list of all published announcements, sorted by publication date.

- **Endpoint**: `GET /api/announcements`
- **Method**: `GET`
- **Success Response (200 OK)**:
  - **Body**: An array of announcement objects.
    ```json
    [
      {
        "id": "2025-11-08-new-dashboard",
        "title": "New Feature Launch!",
        "author": { "name": "Amamiya", "avatarUrl": "/images/amamiya.jpg" },
        "content": "We are excited to announce the launch of our new dashboard! 🎉...",
        "imageUrl": "/images/announcements/dashboard.png",
        "severity": "info",
        "publishedAt": "2025-11-08"
      }
    ]
    ```

### 2. Create a New Announcement (Admin Only)

- **Endpoint**: `POST /api/admin/announcements`
- **Method**: `POST`
- **Request Body** (`application/json`):

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | Yes | The main title of the announcement. |
| `content` | `string` | Yes | The full content in Markdown format. |
| `severity`| `string` | Yes | Severity level: `info`, `warning`, `alert`. |
| `imageUrl` | `string` \| `null` | No | URL to an associated image. |
| `publishedAt`| `string` | No | Date in `YYYY-MM-DD` format. Defaults to the current date. |

- **Success Response (201 Created)**: Returns the full object of the newly created announcement.

### 3. Update an Announcement (Admin Only)

- **Endpoint**: `PUT /api/admin/announcements/[id]`
- **Request Body**: Same as `POST`, but all fields are optional.
- **Success Response (200 OK)**: Returns the complete, updated announcement object.

### 4. Delete an Announcement (Admin Only)

- **Endpoint**: `DELETE /api/admin/announcements/[id]`
- **Success Response (200 OK)**:
  ```json
  { "message": "Announcement deleted successfully" }
  ```

---

## Banners API

### 1. Get Active Banners (Public)

Retrieves a list of all banners that are currently active based on their `displayFrom` and `displayUntil` dates.

- **Endpoint**: `GET /api/banners/active`
- **Method**: `GET`
- **Success Response (200 OK)**:
  - **Body**: An array of active banner objects.
    ```json
    [
      {
        "id": "c2a8c9a8-3d1f-4f6d-9b3d-2e1b3e3a4c1b",
        "title": "Scheduled Maintenance",
        "shortDescription": "Services will be temporarily unavailable this Sunday.",
        "url": "/docs/status",
        "severity": "warning",
        "displayFrom": "2025-11-10T00:00:00.000Z",
        "displayUntil": "2025-11-16T23:59:59.999Z"
      }
    ]
    ```

### 2. Get All Banners (Admin Only)

- **Endpoint**: `GET /api/admin/banners`
- **Success Response (200 OK)**: Returns an array of all banner objects, regardless of their active status.

### 3. Create a New Banner (Admin Only)

- **Endpoint**: `POST /api/admin/banners`
- **Request Body** (`application/json`):

| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `title` | `string` | Yes | The main title of the banner. |
| `severity`| `string` | Yes | Severity level: `info`, `warning`, `alert`. |
| `shortDescription`| `string` | No | A brief summary for the banner text. |
| `url` | `string` | No | A URL to link to when the banner is clicked. |
| `displayFrom` | `string` \| `null` | No | ISO 8601 date string. The banner will be visible from this date. |
| `displayUntil` | `string` \| `null` | No | ISO 8601 date string. The banner will be hidden after this date. |

- **Success Response (201 Created)**: Returns the full object of the newly created banner.

### 4. Update a Banner (Admin Only)

- **Endpoint**: `PUT /api/admin/banners/[id]`
- **Request Body**: Same as `POST`, but all fields are optional.
- **Success Response (200 OK)**: Returns the complete, updated banner object.

### 5. Delete a Banner (Admin Only)

- **Endpoint**: `DELETE /api/admin/banners/[id]`
- **Success Response (200 OK)**:
  ```json
  { "message": "Banner deleted successfully" }

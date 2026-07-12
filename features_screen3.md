# Screen 3 - Organization Setup Backend Features

This document details the backend features implemented for **Screen 3 (Organization Setup)** of the **AssetFlow** platform.

---

## 1. Department Management
Manages the company hierarchy and structures department allocations.

- **Endpoints Exposed**:
  - `POST /api/v1/departments` — Create a new department.
  - `PUT /api/v1/departments/{id}` — Update department attributes, parent relationship, or department head.
  - `GET /api/v1/departments/{id}` — Retrieve a single department's detailed record.
  - `GET /api/v1/departments` — List departments with pagination and search.
  - `PATCH /api/v1/departments/{id}/status` — Activate/deactivate a department.
  - `GET /api/v1/departments/dropdown` — Dropdown of active departments (accessible by all users).
- **Core Business Rules**:
  - **Unique Name & Code**: The system validates that department names and codes are completely unique across the application.
  - **Circular Hierarchy Prevention**: When setting or updating a parent department, the system recursively checks the ancestor tree. It raises a `CircularHierarchyException` if a loop is detected or if a department sets itself as parent.
  - **Department Head Verification**: Department heads must be active users, and they must belong to the department they are being assigned to manage.

---

## 2. Asset Categories
Manages types of assets and custom technical fields.

- **Endpoints Exposed**:
  - `POST /api/v1/categories` — Register a new asset category.
  - `PUT /api/v1/categories/{id}` — Update category name, code, description, or custom fields.
  - `GET /api/v1/categories/{id}` — Retrieve details of a single category.
  - `GET /api/v1/categories` — List active categories with pagination and search.
  - `PATCH /api/v1/categories/{id}/status` — Toggle status between `Active` and `Inactive`.
  - `DELETE /api/v1/categories/{id}` — Soft delete an asset category.
  - `GET /api/v1/categories/dropdown` — Dropdown of active, non-soft-deleted categories.
- **Core Business Rules**:
  - **Custom Fields (JSONB)**: The category model maps a dictionary of custom attributes (like warranty period or operating system version) which assets belonging to this category can inherit.
  - **Soft Delete Implementation**: Deleting a category sets `is_deleted = True` instead of performing a hard DB DELETE. Soft-deleted categories are filtered out of all listings, details, and dropdown responses.

---

## 3. Employee Directory
Enables administrators to manage users, roles, and status states.

- **Endpoints Exposed**:
  - `GET /api/v1/employees` — List, search (by name/email), and filter employees by department and role with full pagination.
  - `GET /api/v1/employees/{id}` — Retrieve details of a single employee.
  - `PUT /api/v1/employees/{id}` — Update employee details (department, name, etc.).
  - `PATCH /api/v1/employees/{id}/status` — Activate or deactivate employee accounts.
  - `PATCH /api/v1/employees/{id}/role` — Promote or demote employee roles.
  - `GET /api/v1/employees/dropdown` — Fetch a dropdown list of all active employees.
- **Core Business Rules**:
  - **RBAC Role Promotion Restrictions**: Only users with the `ADMIN` role are allowed to execute role promotion or demotion actions.
  - **Anti-Self-Promotion Rule**: Users cannot modify their own roles (an admin cannot demote themselves, and employees cannot promote themselves).
  - **Activation Logs**: Status toggle actions automatically log activity to feed the Screen 2 Dashboard.

---

## 4. Activity Logs Integration
To feed the Screen 2 dashboard widgets, modifications in Screen 3 trigger automated logs into the `ActivityLog` table.
- **DEPARTMENT_CREATED** / **DEPARTMENT_UPDATED** / **DEPARTMENT_HEAD_ASSIGNED**
- **CATEGORY_CREATED** / **CATEGORY_UPDATED**
- **EMPLOYEE_ACTIVATED** / **EMPLOYEE_DEACTIVATED** / **EMPLOYEE_ROLE_CHANGED**

---

## 5. API Design & Security
- **Unified Payload Contracts**: Success responses use the wrapper:
  ```json
  { "success": true, "message": "...", "data": { ... } }
  ```
  Failures use:
  ```json
  { "success": false, "message": "..." }
  ```
- **Unified Pagination Metadata**:
  ```json
  {
    "currentPage": 1,
    "pageSize": 10,
    "totalItems": 100,
    "totalPages": 10
  }
  ```
- **Role Verification Dependencies**: Implemented `deps.require_role_async` to enforce route-level RBAC scopes.

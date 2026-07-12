# AssetFlow - Dashboard Backend Features

This document provides a detailed summary of all the backend features, architectural components, and design implementations added for **Screen 2 (Dashboard / Home Screen)** of **AssetFlow** (Enterprise Asset & Resource Management System).

---

## 1. Unified Dashboard Endpoint
We have implemented a single, highly optimized endpoint:
- **`GET /api/v1/dashboard`**
  - **Summary**: Retrieve Dashboard Data
  - **Description**: Fetches aggregated summary metrics, active alerts, recent activity, quick action permissions, and user profile metadata based on the authenticated user's Role-Based Access Control (RBAC) permissions.
  - **Response Model**: `DashboardResponse`
  - **Status Codes**: 200 (Success), 401 (Unauthorized), 403 (Permission Denied/Inactive account), 500 (Internal Server Error).

---

## 2. Role-Based Access Control (RBAC) & Data Filtering
The dashboard dynamically shapes and filters metrics, recent activities, and alerts at the database level using context-aware SQLAlchemy queries depending on the authenticated user's role:

*   **ADMIN (Administrator)**
    *   **Scope**: View organization-wide data (no filters).
    *   **Quick Actions**: `registerAsset = True`, `bookResource = True`, `raiseMaintenance = True`.
*   **ASSET_MANAGER (Asset Manager)**
    *   **Scope**: View data strictly related to assets managed by them (`Asset.managed_by_id == current_user.id`).
    *   **Quick Actions**: `registerAsset = True`, `bookResource = True`, `raiseMaintenance = True`.
*   **DEPARTMENT_HEAD (Department Head)**
    *   **Scope**: View data related strictly to their department (`Asset.department_id == current_user.department_id` or `User.department_id == current_user.department_id`).
    *   **Quick Actions**: `registerAsset = False`, `bookResource = True`, `raiseMaintenance = True`.
*   **EMPLOYEE (Employee)**
    *   **Scope**: View only their allocated assets (`AssetAllocation.user_id == current_user.id`), their bookings, their maintenance, and their activities.
    *   **Quick Actions**: `registerAsset = False`, `bookResource = True`, `raiseMaintenance = True`.

---

## 3. Real-Time Summary KPIs (Aggregation)
Summary cards are populated using optimal, index-backed database count queries:
-   **`assetsAvailable`**: Count of assets where `status = AVAILABLE` (scoped by role). For employees, this returns available assets in their department or globally shared bookable assets.
-   **`assetsAllocated`**: Count of assets where `status = ALLOCATED` (scoped by role). For employees, this counts assets currently allocated to them.
-   **`maintenanceToday`**: Count of active maintenance requests scheduled for `today` (scoped by role).
-   **`activeBookings`**: Count of resource bookings with `status = ONGOING` (scoped by role).
-   **`pendingTransfers`**: Count of transfer requests with `status = PENDING` (scoped by role).
-   **`upcomingReturns`**: Count of active asset allocations where `expected_return_date` is between `today` and `today + 7 days` (scoped by role).
-   **`overdueReturns`**: Count of active asset allocations where `expected_return_date` is before `today` and the asset is not returned (scoped by role).

---

## 4. Dynamic Alerts Engine
Alerts are generated dynamically on every dashboard call using aggregation count queries, assigning appropriate severity and message templates:
1.  **Overdue Returns Alert**: Raised with `HIGH` severity if there are overdue returns.
2.  **Pending Maintenance Alert**: Raised with `MEDIUM` severity if there are maintenance requests pending approval.
3.  **Pending Transfers Alert**: Raised with `MEDIUM` severity if there are transfer requests pending approval.
4.  **Audit Due Alert**: Raised with `HIGH` severity for **Admins** and **Asset Managers** if there is no physical audit cycle activity log recorded in the last 30 days.
5.  **Upcoming Maintenance Alert**: Raised with `INFO` severity if there are maintenance requests scheduled in the next 7 days.

---

## 5. Recent Activities Feed
Fetches the **latest 10 activities** ordered by `created_at` descending, scoped according to the user's role:
-   **Admin**: Organization-wide activities.
-   **Asset Manager**: Activities on assets managed by them or performed by them.
-   **Department Head**: Activities performed by members of their department or on department assets.
-   **Employee**: Activities performed by themselves.

---

## 6. Database Models (SQLAlchemy 2.0 Async)
Defined async ORM definitions under `app/models/` for all assumed schemas, which automatically registers them with SQLAlchemy/Alembic:
-   `Department` (with head assignments and hierarchical self-references)
-   `User` (with roles, active statuses, and department references)
-   `Asset` (with tags, names, statuses, and managers)
-   `AssetAllocation` (with allocation timing and return status)
-   `Booking` (with resource allocation timelines)
-   `MaintenanceRequest` (with descriptions, priorities, and scheduling)
-   `TransferRequest` (with request workflows)
-   `ActivityLog` (with detailed audit logs)

---

## 7. Performance & Optimization Features
-   **Concurrent Query Execution**: Using `asyncio.gather`, we execute all count queries for KPIs, alerts, and recent activities in parallel, maximizing PostgreSQL concurrency and avoiding serial backend blocking.
-   **Lazy-Loading Prevention**: Asynchronously queries relationships (e.g. department names) instead of accessing lazy properties directly, preventing `GreenletExit` or lazy load errors.
-   **Memory-efficient SQL**: Performs `COUNT` operations at the database level rather than fetching objects into memory.

---

## 8. Global Exception Handling
Configured custom exceptions (`DashboardException`, `DashboardLoadError`) caught globally by FastAPI middlewares to guarantee clean, JSON-serializable responses in case of failures:
```json
{
  "success": false,
  "message": "Dashboard could not be loaded."
}
```

---

## 9. Comprehensive Testing Framework
Added a test suite under `backend/tests/` configured with `pytest` and `pytest-asyncio`:
-   **Async SQLite In-Memory Database**: Isolated test executions using function-scoped test sessions.
-   **Scoping Assertions**: Fully tests the data access scoping rules for `Admin`, `Asset Manager`, `Department Head`, and `Employee`.
-   **Dynamic Checks**: Tests alert triggers (e.g., Audit Due disappearing when an audit log is seeded within 30 days) and permissions.

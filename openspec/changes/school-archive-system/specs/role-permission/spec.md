# Role & Permission Specification

## ADDED Requirements

### Requirement: Role-Based Access Control
The system SHALL implement RBAC with predefined roles.

#### Scenario: Default roles
- **WHEN** system initializes
- **THEN** the following roles exist: Admin, Teacher, Student, Viewer

#### Scenario: Role assignment
- **WHEN** admin assigns a role to a user
- **THEN** user inherits all permissions associated with that role

### Requirement: Permission Granularity
The system SHALL support fine-grained permissions for resources.

#### Scenario: Archive permissions
- **WHEN** permission is checked for archive resource
- **THEN** system evaluates: view, create, edit, delete, export permissions

#### Scenario: File permissions
- **WHEN** permission is checked for file resource
- **THEN** system evaluates: upload, download, preview, delete permissions

### Requirement: Permission Inheritance
The system SHALL support permission inheritance through role hierarchy.

#### Scenario: Admin full access
- **WHEN** user has Admin role
- **THEN** user has all permissions across all resources

#### Scenario: Teacher limited access
- **WHEN** user has Teacher role
- **THEN** user can view/edit student archives in assigned classes, but cannot delete

#### Scenario: Student read-only
- **WHEN** user has Student role
- **THEN** user can only view own archive and download own documents

### Requirement: Dynamic Permission Check
The system SHALL check permissions on every protected resource access.

#### Scenario: Unauthorized access attempt
- **WHEN** user attempts action without required permission
- **THEN** system returns 403 Forbidden with permission name in error message

#### Scenario: Permission caching
- **WHEN** user permissions are loaded
- **THEN** system caches permissions for session duration with invalidation on role change

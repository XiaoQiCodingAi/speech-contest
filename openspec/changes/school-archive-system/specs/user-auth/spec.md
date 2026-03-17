# User Authentication Specification

## ADDED Requirements

### Requirement: User Login
The system SHALL allow users to authenticate using username and password.

#### Scenario: Successful login
- **WHEN** user submits valid credentials
- **THEN** system returns a JWT token and stores session information

#### Scenario: Invalid credentials
- **WHEN** user submits invalid credentials
- **THEN** system returns 401 error with "Invalid credentials" message

#### Scenario: Account locked
- **WHEN** user attempts login after 5 consecutive failed attempts
- **THEN** system returns 423 error with "Account locked" message

### Requirement: Session Management
The system SHALL manage user sessions with configurable expiration.

#### Scenario: Session expiration
- **WHEN** session exceeds configured timeout (default 24 hours)
- **THEN** system invalidates the token and requires re-authentication

#### Scenario: Token refresh
- **WHEN** user makes request with valid token nearing expiration
- **THEN** system issues a new token with extended expiration

### Requirement: Logout
The system SHALL allow users to terminate their session.

#### Scenario: Successful logout
- **WHEN** user requests logout
- **THEN** system invalidates the current token and returns success

### Requirement: Password Security
The system SHALL enforce password security policies.

#### Scenario: Password complexity
- **WHEN** user sets a new password
- **THEN** system validates minimum 8 characters, including uppercase, lowercase, number, and special character

#### Scenario: Password hashing
- **WHEN** user registers or changes password
- **THEN** system stores only bcrypt-hashed password (cost factor >= 12)

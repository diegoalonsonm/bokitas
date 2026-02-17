---
trigger: always_on
---

# Shared Development Rules

> These rules apply to ALL projects regardless of tech stack. Every agent must follow these standards at all times.

---

## Soft Deletes (No Physical Deletes)

**NEVER perform physical deletes on any database.** All deletions must be logical (soft deletes).

- Every database table MUST have a soft-delete flag column (`active`, `IsActive`, or equivalent).
- All `SELECT` / `GET` queries MUST filter to return only active records.
- All `DELETE` operations MUST be implemented as `UPDATE` statements that set the soft-delete flag to inactive.
- All `INSERT` / `CREATE` operations MUST set the soft-delete flag to active.
- All `UPDATE` operations MUST include the active-flag filter so only active records are modified.

```
-- WRONG: physical delete
DELETE FROM entity WHERE id = :id;

-- CORRECT: logical delete
UPDATE entity SET [active_flag] = [inactive_value] WHERE id = :id AND [active_flag] = [active_value];
```

---

## TypeScript Strict Mode

All TypeScript projects MUST use strict mode. The `tsconfig.json` must include:

- `"strict": true`
- `"noImplicitAny": true`
- `"strictNullChecks": true`

Never use `any` type unless absolutely unavoidable, and document why.

---

## Parameterized Queries

NEVER concatenate user input into SQL queries. Always use parameterized queries / prepared statements with named replacements, regardless of the ORM or database library.

```
-- WRONG
"SELECT * FROM users WHERE id = " + userId

-- CORRECT (parameterized)
"SELECT * FROM users WHERE id = :userId" with replacements: { userId }
"SELECT * FROM users WHERE id = @UserId" with parameters: { UserId }
```

---

## Environment Variables & Secrets

- NEVER commit `.env`, `.env.local`, or any file containing real secrets.
- ALWAYS maintain a `.env.example` (or equivalent template) with placeholder values that IS committed.
- Use strong secrets (32+ characters for JWT keys, API keys, etc.).
- Access environment variables through the framework's standard mechanism, never hardcode values.

---

## Project Structure

All projects follow a layered architecture with clear separation of concerns:

- **Routes / Controllers**: Handle HTTP requests and responses only. No business logic, no direct database access.
- **Business Logic / Flow**: Orchestrate operations, apply validation and business rules.
- **Data Access / Models / Repositories**: Execute database queries. Only this layer touches the database.
- **Types / Interfaces**: Define contracts. Shared across layers.

Data flows in one direction: `Request -> Route/Controller -> Business Logic -> Data Access -> Database`

Never skip layers. A controller must not call a repository directly.

---

## Naming Conventions

### General Rules

| Element | Convention |
|---------|------------|
| Interfaces / Types | PascalCase |
| Classes | PascalCase |
| Methods / Functions | camelCase (TypeScript/JS) or PascalCase (C#) |
| Variables | camelCase |
| Constants | UPPER_SNAKE_CASE |
| Database columns | camelCase (TypeScript/JS projects) or PascalCase (C# projects) |
| API routes | lowercase with hyphens |

### Primary Keys

- Use UUIDs for primary keys, not auto-incrementing integers.
- Name the column `id` (TypeScript/JS) or `EntityId` like `UserId` (C#).

### Foreign Keys

- Name as `entityId` (e.g., `userId`, `categoryId`) in TypeScript/JS.
- Name as `EntityId` (e.g., `UserId`, `CategoryId`) in C#.

### Timestamps

- Include `createdAt` and `updatedAt` (or `CreatedAt`, `UpdatedAt` in C#) on all entities where appropriate.

---

## API Response Standards

Use consistent HTTP status codes across all backends:

| Code | Meaning | When to use |
|------|---------|-------------|
| `200` | OK | Successful GET, PUT |
| `201` | Created | Successful POST (resource created) |
| `204` | No Content | Successful DELETE |
| `400` | Bad Request | Validation errors, missing required fields |
| `401` | Unauthorized | Missing or invalid authentication |
| `404` | Not Found | Resource does not exist or is soft-deleted |
| `409` | Conflict | Duplicate resource (e.g., email already registered) |
| `500` | Internal Server Error | Unexpected server failure |

Always return structured error responses, never raw strings in production.

---

## Authentication

- Use JWT (JSON Web Tokens) for stateless authentication.
- Store tokens securely (HttpOnly cookies for web, SecureStore for mobile).
- Always validate the token on the server for every protected request.
- Never expose user passwords in API responses.
- Hash passwords before storing (bcrypt or equivalent).

---

## Documentation Requirements

Every project MUST maintain these documentation directories under `docs/`:

### Entity Documentation (`docs/entities/`)
For each database entity, document: properties, types, relationships, and validation rules.

### Endpoint Documentation (`docs/endpoints/`)
For each API endpoint group, document: method, path, request body/params, response format.

### Postmortem Documentation (`docs/postmortem/`)
After any non-trivial bug fix, create a postmortem with:
- **Problem**: What went wrong.
- **Root Cause**: Why it happened.
- **Solution**: What fixed it.
- **Failed Attempts**: What was tried that did not work (if any).
- **Prevention**: How to avoid it in the future.
- **Related Files**: Which files were affected.

File naming: `MM-DD-YY_ENTITY_ISSUE.md`

Create a postmortem when:
- A fix required multiple attempts.
- The issue was unexpected or confusing.
- The same pattern could appear elsewhere.

---

## Agent Session Behavior

### On Every Session Start

1. Read the project's rules file.
2. Check `docs/postmortem/` for recent issues to avoid repeating past mistakes.
3. Review existing types, models, and components before creating new ones to avoid duplication.

### When Fixing Bugs

1. Check the postmortem folder for similar past issues.
2. After fixing, create a postmortem if the criteria above are met.
3. Kill the server everytime is started in order to test any implemented fix.

### When Creating New Features

1. Check for existing patterns and follow them.
2. Create all required layers (types, data access, business logic, controller/route).
3. Update documentation.

### Documentation Updates

- Entity created/updated/deleted -> Update `docs/entities/`.
- Endpoint created/updated/deleted -> Update `docs/endpoints/`.
- Component created/updated/deleted -> Update `docs/components/` (frontend/mobile).
- Bug fixed after struggle -> Create postmortem.

---

## Code Quality Standards

- All functions and methods must have explicit return types.
- Prefer named exports over default exports (except where the framework requires default, e.g., Expo Router screens, Next.js pages).
- Keep functions focused: one function, one responsibility.
- Handle errors explicitly. Never swallow exceptions silently.
- Log errors with enough context to debug (structured logging preferred).
- Validate all external input (request bodies, query params, URL params) before processing.
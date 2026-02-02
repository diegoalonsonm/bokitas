# Usuarioblock (User Block)

Relationship tracking which users have blocked which users.

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| idbloqueador | uuid | Yes | Foreign key to usuario.id (blocker - composite primary key) |
| idbloqueo | uuid | Yes | Foreign key to usuario.id (blocked user - composite primary key) |
| active | boolean | Yes | Soft delete flag (default: true) |
| createdat | timestamptz | Yes | Creation timestamp (default: now()) |
| updatedat | timestamptz | Yes | Last update timestamp (default: now()) |

## TypeScript Interface

\`\`\`typescript
interface Usuarioblock {
  idbloqueador: string
  idbloqueo: string
  active: boolean
  createdat: Date
  updatedat: Date
}
\`\`\`

## Relationships

- Belongs to Usuario (idbloqueador - the one blocking)
- Belongs to Usuario (idbloqueo - the one being blocked)

## Notes

- Composite primary key on (idbloqueador, idbloqueo)
- Same user pair can only exist once (idbloqueador, idbloqueo)
- Blocking is directional - if A blocks B, B can still see A unless B also blocks A
- To unblock, set `active = false` (soft delete)
- Blocking typically supersedes following (blocked user cannot interact)
- Physical deletes are never performed - always use `active = false` for soft deletes
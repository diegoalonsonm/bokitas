# Usuariofollow (User Follow)

Relationship tracking which users follow which users.

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| idseguidor | uuid | Yes | Foreign key to usuario.id (follower - composite primary key) |
| idseguido | uuid | Yes | Foreign key to usuario.id (followed user - composite primary key) |
| idestado | uuid | No | Foreign key to estado.id (relationship state) |
| active | boolean | Yes | Soft delete flag (default: true) |
| createdat | timestamptz | Yes | Creation timestamp (default: now()) |
| updatedat | timestamptz | Yes | Last update timestamp (default: now()) |

## TypeScript Interface

\`\`\`typescript
interface Usuariofollow {
  idseguidor: string
  idseguido: string
  idestado?: string | null
  active: boolean
  createdat: Date
  updatedat: Date
}
\`\`\`

## Relationships

- Belongs to Estado (idestado)
- Belongs to Usuario (idseguidor - the follower)
- Belongs to Usuario (idseguido - the followed user)

## Notes

- Composite primary key on (idseguidor, idseguido)
- Same user pair can only exist once (idseguidor, idseguido)
- To unfollow, set `active = false` (soft delete)
- Users can follow themselves (typically blocked in application logic)
- Mutual follow = both users have records (each as the follower)
- Physical deletes are never performed - always use `active = false` for soft deletes
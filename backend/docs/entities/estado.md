# Estado (State)

Status entity for tracking the state of various records (users, lists, reviews, restaurants, etc.).

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| id | uuid | Yes | Primary key (auto-generated) |
| nombre | varchar | Yes | State name (e.g., "Active", "Inactive", "Deleted", "Pending", "Blocked") |
| active | boolean | Yes | Soft delete flag (true = active, false = deleted) |
| createdat | timestamptz | Yes | Creation timestamp (default: now()) |
| updatedat | timestamptz | Yes | Last update timestamp (default: now()) |

## TypeScript Interface

\`\`\`typescript
interface Estado {
  id: string
  nombre: string
  active: boolean
  createdat: Date
  updatedat: Date
}
\`\`\`

## Relationships

- Has many Usuario (idestado)
- Has many Tipocomida (idestado)
- Has many Restaurante (idestado)
- Has many Review (idestado)
- Has many Lista (idestado)
- Has many Listaitem (idestado)
- Has many Eatlist (idestado)
- Has many Usuariofollow (idestado)
- Has many Usuarioblock (idestado)

## Common State Values

- `9aca8808-a7a2-4d43-8be8-d341655caa3e` - Active
- `31d61dcd-cb50-47f2-a0c2-d494ec358fd4` - Inactive
- `dbed121f-7214-41be-ad06-c12c7ae0d7de` - Deleted
- `05e31c9e-093c-406a-bf6a-ec457f143e9c` - Pending
- `fdec242e-0080-42d9-8307-98a72982d9ae` - Blocked

## Notes

- This is a reference table with fixed state values
- States are typically not modified after creation
- Used for maintaining consistent state management across the application
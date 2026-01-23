# Listamiembro (List Member)

Users who are members of a list with their roles.

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| idlista | uuid | Yes | Foreign key to lista.id (composite primary key) |
| idusuario | uuid | Yes | Foreign key to usuario.id (composite primary key) |
| rol | varchar | No | Member role (default: "viewer") |
| active | boolean | Yes | Soft delete flag (default: true) |
| createdat | timestamptz | Yes | Creation timestamp (default: now()) |
| updatedat | timestamptz | Yes | Last update timestamp (default: now()) |

## TypeScript Interface

\`\`\`typescript
interface Listamiembro {
  idlista: string
  idusuario: string
  rol?: string | null
  active: boolean
  createdat: Date
  updatedat: Date
}
\`\`\`

## Relationships

- Belongs to Lista (idlista)
- Belongs to Usuario (idusuario)

## Notes

- Composite primary key on (idlista, idusuario)
- **rol** options (examples):
  - `"viewer"` - Can view list only
  - `"editor"` - Can add/remove restaurants
  - `"admin"` - Full control (delete list, manage members)
- Creator is implicitly admin (not stored separately)
- Physical deletes are never performed - always use `active = false` for soft deletes
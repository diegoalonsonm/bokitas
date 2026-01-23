# Lista (List)

Restaurant lists created by users for organization.

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| id | uuid | Yes | Primary key (auto-generated) |
| nombre | varchar | Yes | List name |
| esprivada | boolean | Yes | Is list private? (default: true) |
| escolaborativa | boolean | Yes | Is list collaborative? (default: false) |
| idusuariocreador | uuid | Yes | Foreign key to usuario.id (list creator) |
| idestado | uuid | No | Foreign key to estado.id (list's current state) |
| active | boolean | Yes | Soft delete flag (default: true) |
| createdat | timestamptz | Yes | Creation timestamp (default: now()) |
| updatedat | timestamptz | Yes | Last update timestamp (default: now()) |

## TypeScript Interface

\`\`\`typescript
interface Lista {
  id: string
  nombre: string
  esprivada: boolean
  escolaborativa: boolean
  idusuariocreador: string
  idestado?: string | null
  active: boolean
  createdat: Date
  updatedat: Date
}
\`\`\`

## Relationships

- Belongs to Estado (idestado)
- Belongs to Usuario (idusuariocreador)
- Has many Listamiembro (idlista)
- Has many Listaitem (idlista)

## Notes

- **esprivada**: If true, only creator and invited members can see the list
- **escolaborativa**: If true, members can edit the list; if false, only creator can edit
- Creator is always a member with special privileges
- Lists can be shared with other users through Listamiembro
- Physical deletes are never performed - always use `active = false` for soft deletes
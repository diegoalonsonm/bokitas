# Listaitem (List Item)

Restaurants added to a list with optional metadata.

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| idlista | uuid | Yes | Foreign key to lista.id (composite primary key) |
| idrestaurante | uuid | Yes | Foreign key to restaurante.id (composite primary key) |
| idusuariocreador | uuid | Yes | Foreign key to usuario.id (who added the item) |
| nota | text | No | Notes about this restaurant in the list (optional) |
| posicion | integer | No | Display position/order in list (optional) |
| active | boolean | Yes | Soft delete flag (default: true) |
| createdat | timestamptz | Yes | Creation timestamp (default: now()) |
| updatedat | timestamptz | Yes | Last update timestamp (default: now()) |

## TypeScript Interface

\`\`\`typescript
interface Listaitem {
  idlista: string
  idrestaurante: string
  idusuariocreador: string
  nota?: string | null
  posicion?: number | null
  active: boolean
  createdat: Date
  updatedat: Date
}
\`\`\`

## Relationships

- Belongs to Lista (idlista)
- Belongs to Restaurante (idrestaurante)
- Belongs to Usuario (idusuariocreador)

## Notes

- Composite primary key on (idlista, idrestaurante, idusuariocreador)
- Same restaurant can appear multiple times in a list if added by different users (if list is collaborative)
- **idusuariocreador** tracks who added the restaurant to the list
- **posicion** can be used for custom ordering (e.g., ranking)
- **nota** stores user-specific notes about why this restaurant is on the list
- Physical deletes are never performed - always use `active = false` for soft deletes
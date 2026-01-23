# Eatlist

User's personal list of restaurants they want to visit.

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| idusuario | uuid | Yes | Foreign key to usuario.id (composite primary key) |
| idrestaurante | uuid | Yes | Foreign key to restaurante.id (composite primary key) |
| flag | boolean | Yes | User's flag (default: false) - purpose varies by application |
| active | boolean | Yes | Soft delete flag (default: true) |
| createdat | timestamptz | Yes | Creation timestamp (default: now()) |
| updatedat | timestamptz | Yes | Last update timestamp (default: now()) |

## TypeScript Interface

\`\`\`typescript
interface Eatlist {
  idusuario: string
  idrestaurante: string
  flag: boolean
  active: boolean
  createdat: Date
  updatedat: Date
}
\`\`\`

## Relationships

- Belongs to Usuario (idusuario)
- Belongs to Restaurante (idrestaurante)

## Notes

- Composite primary key on (idusuario, idrestaurante)
- Represents a user's personal bookmark/wishlist for restaurants
- Each user can only have one entry per restaurant
- **flag** is a flexible boolean that can be used for:
  - Marking as "visited"
  - Marking as "favorite"
  - Any other binary state the application requires
- Physical deletes are never performed - always use `active = false` for soft deletes
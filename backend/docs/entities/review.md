# Review

User reviews for restaurants.

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| id | uuid | Yes | Primary key (auto-generated) |
| comentario | text | No | Review comment text (optional) |
| puntuacion | numeric | Yes | Rating score (1-5, enforced by check constraint) |
| urlfotoreview | text | No | Review photo URL (optional) |
| idrestaurante | uuid | Yes | Foreign key to restaurante.id |
| idusuario | uuid | Yes | Foreign key to usuario.id |
| idestado | uuid | No | Foreign key to estado.id (review's current state) |
| active | boolean | Yes | Soft delete flag (default: true) |
| createdat | timestamptz | Yes | Creation timestamp (default: now()) |
| updatedat | timestamptz | Yes | Last update timestamp (default: now()) |

## TypeScript Interface

\`\`\`typescript
interface Review {
  id: string
  comentario?: string | null
  puntuacion: number
  urlfotoreview?: string | null
  idrestaurante: string
  idusuario: string
  idestado?: string | null
  active: boolean
  createdat: Date
  updatedat: Date
}
\`\`\`

## Relationships

- Belongs to Restaurante (idrestaurante)
- Belongs to Usuario (idusuario)
- Belongs to Estado (idestado)

## Validation Rules

- puntuacion: must be between 1 and 5 (database-enforced constraint)
- idusuario: user who wrote the review
- idrestaurante: restaurant being reviewed

## Notes

- **puntuacion** constraint: `puntuacion >= 1::numeric AND puntuacion <= 5::numeric`
- Users can review multiple restaurants
- One user can leave multiple reviews for the same restaurant
- Reviews contribute to the restaurant's overall `puntuacion`
- Physical deletes are never performed - always use `active = false` for soft deletes
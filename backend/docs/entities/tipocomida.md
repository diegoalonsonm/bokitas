# Tipocomida (Food Type)

Food type or cuisine category for restaurants.

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| id | uuid | Yes | Primary key (auto-generated) |
| nombre | varchar | Yes | Food type name (e.g., "Mexican", "Italian", "Asian") |
| idestado | uuid | No | Foreign key to estado.id (food type's current state) |
| active | boolean | Yes | Soft delete flag (default: true) |
| createdat | timestamptz | Yes | Creation timestamp (default: now()) |
| updatedat | timestamptz | Yes | Last update timestamp (default: now()) |

## TypeScript Interface

\`\`\`typescript
interface Tipocomida {
  id: string
  nombre: string
  idestado?: string | null
  active: boolean
  createdat: Date
  updatedat: Date
}
\`\`\`

## Relationships

- Belongs to Estado (idestado)
- Has many Restaurantetipocomida (idtipocomida)

## Validation Rules

- nombre: required, text string

## Notes

- Used to categorize restaurants by cuisine type
- Many-to-many relationship with Restaurant through Restaurantetipocomida junction table
- Pre-seeded with common food types
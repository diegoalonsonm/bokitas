# Restaurantetipocomida (Restaurant-Food Type Junction)

Many-to-many junction table linking restaurants to food types.

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| idrestaurante | uuid | Yes | Foreign key to restaurante.id (composite primary key) |
| idtipocomida | uuid | Yes | Foreign key to tipocomida.id (composite primary key) |
| createdat | timestamptz | Yes | Creation timestamp (default: now()) |
| updatedat | timestamptz | Yes | Last update timestamp (default: now()) |

## TypeScript Interface

\`\`\`typescript
interface Restaurantetipocomida {
  idrestaurante: string
  idtipocomida: string
  createdat: Date
  updatedat: Date
}
\`\`\`

## Relationships

- Belongs to Restaurante (idrestaurante)
- Belongs to Tipocomida (idtipocomida)

## Notes

- Composite primary key on (idrestaurante, idtipocomida)
- Prevents duplicate restaurant-food type pairings
- Allows restaurants to have multiple food types
- Allows food types to be associated with multiple restaurants
- No soft delete - cascade delete or use parent table `active` flags
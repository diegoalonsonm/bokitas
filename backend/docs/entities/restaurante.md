# Restaurante (Restaurant)

Restaurant entity for managing restaurant listings.

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| id | uuid | Yes | Primary key (auto-generated) |
| nombre | varchar | Yes | Restaurant name |
| direccion | text | No | Restaurant address (optional) |
| latitud | numeric | No | Latitude coordinate (optional) |
| longitud | numeric | No | Longitude coordinate (optional) |
| urlfotoperfil | text | No | Profile photo URL (optional) |
| urlpaginarestaurante | text | No | Restaurant website URL (optional) |
| puntuacion | numeric | No | Average rating score (default: 0) |
| googleplaceid | varchar | No | Google Places API ID (unique, optional) |
| foursquareid | varchar | No | Foursquare venue ID (unique, optional) |
| idestado | uuid | No | Foreign key to estado.id (restaurant's current state) |
| active | boolean | Yes | Soft delete flag (default: true) |
| createdat | timestamptz | Yes | Creation timestamp (default: now()) |
| updatedat | timestamptz | Yes | Last update timestamp (default: now()) |

## TypeScript Interface

\`\`\`typescript
interface Restaurante {
  id: string
  nombre: string
  direccion?: string | null
  latitud?: number | null
  longitud?: number | null
  urlfotoperfil?: string | null
  urlpaginarestaurante?: string | null
  puntuacion?: number | null
  googleplaceid?: string | null
  foursquareid?: string | null
  idestado?: string | null
  active: boolean
  createdat: Date
  updatedat: Date
}
\`\`\`

## Relationships

- Belongs to Estado (idestado)
- Has many Restaurantetipocomida (idrestaurante)
- Has many Review (idrestaurante)
- Has many Eatlist (idrestaurante)
- Has many Listaitem (idrestaurante)

## Validation Rules

- nombre: required
- latitud: must be valid latitude (-90 to 90)
- longitud: must be valid longitude (-180 to 180)
- puntuacion: numeric value (typically 0-5 scale)

## Notes

- **puntuacion** is calculated from review averages
- **googleplaceid** and **foursquareid** are for external API integration
- Coordinates (latitud/longitud) enable location-based features
- Physical deletes are never performed - always use `active = false` for soft deletes
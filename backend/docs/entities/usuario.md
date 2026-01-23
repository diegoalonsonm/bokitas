# Usuario (User)

User entity for managing application users.

## Properties

| Property | Type | Required | Description |
|----------|------|----------|-------------|
| id | uuid | Yes | Primary key (auto-generated) |
| authid | uuid | Yes | Foreign key to auth.users.id (unique) |
| nombre | varchar | Yes | User's first name |
| primerapellido | varchar | Yes | User's first last name |
| segundoapellido | varchar | No | User's second last name (optional) |
| correo | varchar | Yes | User's email address (unique) |
| telefono | varchar | No | User's phone number (optional) |
| urlfotoperfil | text | No | Profile photo URL (optional) |
| provincia | varchar | No | User's province (optional) |
| bio | text | No | User biography/description (optional) |
| idestado | uuid | No | Foreign key to estado.id (user's current state) |
| active | boolean | Yes | Soft delete flag (default: true) |
| createdat | timestamptz | Yes | Account creation timestamp (default: now()) |
| updatedat | timestamptz | Yes | Last update timestamp (default: now()) |

## TypeScript Interface

\`\`\`typescript
interface Usuario {
  id: string
  authid: string
  nombre: string
  primerapellido: string
  segundoapellido?: string | null
  correo: string
  telefono?: string | null
  urlfotoperfil?: string | null
  provincia?: string | null
  bio?: string | null
  idestado?: string | null
  active: boolean
  createdat: Date
  updatedat: Date
}
\`\`\`

## Relationships

- Belongs to Estado (idestado)
- Has many Listamiembro (idseguidor)
- Has many Listamiembro (idseguido through Usuariofollow)
- Has many Usuarioblock (idbloqueador)
- Has many Usuarioblock (idbloqueo)
- Has many Review (idusuario)
- Has many Eatlist (idusuario)
- Has many Listamiembro (idusuario)
- Has many Lista (idusuariocreador)
- Has many Listaitem (idusuariocreador)

## Validation Rules

- nombre: minimum 2 characters
- primerapellido: minimum 2 characters
- correo: must be valid email format (unique)
- password (auth): minimum 6 characters (stored in auth.users)

## Notes

- **authid** is the reference to Supabase Auth user
- **correo** is the email field (Spanish naming convention)
- Physical deletes are never performed - always use `active = false` for soft deletes
- User profile can be updated after registration
- Photo URLs are stored as text to support different storage providers
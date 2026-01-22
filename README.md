# Bokitas

A mobile application for discovering, rating, and reviewing restaurants. Think of it as a "watchlist but for eating" - an **Eatlist** where users can track places they want to visit, share their dining experiences, and discover new restaurants based on recommendations from people they follow.

## Overview

Bokitas helps food enthusiasts in Costa Rica discover new dining spots, save restaurants they want to visit, and share their culinary experiences with friends and the community. Users can create personalized lists, follow other food lovers, and get recommendations based on their preferences.

## Key Features

### Phase 1 - Core MVP
- **Authentication**: User registration, login, password recovery
- **User Profiles**: View and edit personal information, profile photo, bio
- **Restaurant Discovery**: Browse restaurants with map integration (Google Places API)
- **Filters & Search**: Filter by food type, distance, ratings
- **Reviews & Ratings**: Create and view restaurant reviews with photos
- **Eatlist**: Personal wishlist of restaurants to visit (visited/want to visit)
- **Top 4 Restaurants**: Highlight favorite restaurants on profile

### Phase 2 - Social Features
- **Follow System**: Follow/unfollow other users
- **Block System**: Block unwanted users (hidden from searches, reviews, follows)
- **Social Reviews**: Like and save reviews from other users
- **Shared Lists**: Create public and collaborative restaurant lists
- **Favorite Dishes**: Track favorite dishes per restaurant

### Phase 3 - Advanced Features
- **Achievements**: Gamification with badges and milestones
- **Push Notifications**: Updates on followed users, list invites, etc.
- **Calendar Integration**: Plan dining dates and get reminders

## Tech Stack

| Component | Technology |
|-----------|------------|
| **Database** | Supabase (PostgreSQL) |
| **File Storage** | Supabase Storage |
| **Backend** | *TBD* |
| **Mobile App** | *TBD* |
| **Maps** | react-native-maps + Google Places API |
| **Push Notifications** | Expo Push Notifications |

## Database Schema Overview

The application uses 12 main tables organized around these core entities:

```
+-----------------------------------------------------------------------------+
|                              DATABASE SCHEMA                                |
+-----------------------------------------------------------------------------+
|                                                                             |
|  USERS & SOCIAL                                                             |
|  +----------+     +---------------+     +--------------+                    |
|  | usuario  |----<| usuarioFollow |>----| usuario      |                    |
|  +----------+     +---------------+     +--------------+                    |
|       |                                                                     |
|       |           +---------------+                                         |
|       +----------<| usuarioBlock  |>----+                                   |
|                   +---------------+                                         |
|                                                                             |
|  RESTAURANTS & CATEGORIES                                                   |
|  +-------------+     +----------------------+     +-------------+           |
|  | restaurante |----<| restauranteTipoComida|>----| tipoComida  |           |
|  +-------------+     +----------------------+     +-------------+           |
|                                                                             |
|  REVIEWS & EATLIST                                                          |
|  +----------+     +---------+     +-------------+                           |
|  | usuario  |----<| review  |>----| restaurante |                           |
|  +----------+     +---------+     +-------------+                           |
|       |                                 |                                   |
|       +-----------<| eatlist |>---------+                                   |
|                                                                             |
|  LISTS                                                                      |
|  +----------+     +---------+     +--------------+     +----------+         |
|  | usuario  |---->|  lista  |----<| listaMiembro |>----| usuario  |         |
|  +----------+     +---------+     +--------------+     +----------+         |
|                        |                                                    |
|                        +----------<| listaItem |>-------| restaurante |     |
|                                                                             |
|  LOOKUP                                                                     |
|  +----------+                                                               |
|  |  estado  | (Status lookup - Active, Inactive, Deleted, etc.)             |
|  +----------+                                                               |
|                                                                             |
+-----------------------------------------------------------------------------+
```

### Entity Summary

| Table | Description |
|-------|-------------|
| `usuario` | User accounts with profile information |
| `usuarioFollow` | Follow relationships between users |
| `usuarioBlock` | Block relationships between users |
| `estado` | Status lookup (Active, Inactive, Deleted, etc.) |
| `restaurante` | Restaurant information with location data |
| `tipoComida` | Food type categories (Italian, Mexican, etc.) |
| `restauranteTipoComida` | Many-to-many: restaurants and their food types |
| `eatlist` | User's wishlist/visited list of restaurants |
| `review` | User reviews and ratings for restaurants |
| `lista` | User-created restaurant lists |
| `listaMiembro` | Members of collaborative lists |
| `listaItem` | Restaurants within a list |

## External Services

### Google Places API
- Used for restaurant discovery and search
- Provides restaurant details: photos, hours, contact info, ratings
- $200 free credit per month (~28,000 requests)
- Best coverage for Costa Rica

### Supabase
- **Database**: PostgreSQL with real-time capabilities
- **Authentication**: Built-in auth (optional to use)
- **Storage**: File storage for profile photos and review images

### Expo Push Notifications
- Free push notification service
- Integrated with Expo/React Native

## Project Structure

```
bokitas/
├── README.md           # This file
├── BACKEND.md          # Backend development guide
├── MOBILE.md           # Mobile development guide
├── backend/            # Node.js backend (TBD)
└── mobile/             # React Native + Expo app (TBD)
```

## Development Workflow

The recommended development order is:

1. **Database** - Set up Supabase, create tables, configure RLS policies
2. **Backend** - Build API endpoints, integrate with Google Places
3. **Mobile** - Develop React Native app, connect to backend

See [BACKEND.md](./BACKEND.md) and [MOBILE.md](./MOBILE.md) for detailed development roadmaps.

## Getting Started

*Instructions will be added once projects are initialized.*

## Contributing

*Guidelines will be added as the project evolves.*

## License

*TBD*

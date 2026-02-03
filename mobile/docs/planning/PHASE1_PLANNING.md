# Bokitas Mobile - Phase 1 MVP Planning Document

> **Last Updated**: February 2025  
> **Status**: Phase 1 Complete  
> **Project**: Bokitas Mobile App (React Native / Expo)

---

## Overview

This document tracks all Phase 1 MVP requirements for the Bokitas mobile application. Items are marked as complete `[x]` or pending `[ ]` based on the current implementation status.

---

## Tech Stack (Verified)

| Technology | Status | Notes |
|------------|--------|-------|
| Expo SDK 50+ | [x] | Configured in `app.config.ts` |
| TypeScript | [x] | Strict mode enabled |
| Expo Router | [x] | File-based routing in `app/` |
| Zustand | [x] | State management in `lib/stores/` |
| Axios | [x] | HTTP client in `lib/api/client.ts` |
| Expo SecureStore | [x] | Token storage |
| Expo Vector Icons | [x] | Ionicons used throughout |

---

## 1. Project Setup

### 1.1 Core Configuration

| Task | Status | File/Location |
|------|--------|---------------|
| Initialize Expo project | [x] | `package.json`, `app.config.ts` |
| Set up TypeScript | [x] | `tsconfig.json` |
| Configure Expo Router (file-based routing) | [x] | `app/_layout.tsx` |
| Configure environment variables | [x] | `app.config.ts`, `lib/constants/config.ts` |
| Set up API client (Axios) | [x] | `lib/api/client.ts` |
| Configure state management (Zustand) | [x] | `lib/stores/` |
| Set up image picker | [x] | `lib/hooks/useImagePicker.ts` |
| Configure react-native-maps | [x] | Used in `app/(tabs)/(home)/map.tsx` |

### 1.2 Project Structure

| Directory | Status | Purpose |
|-----------|--------|---------|
| `app/` | [x] | Expo Router screens |
| `app/(auth)/` | [x] | Authentication screens |
| `app/(tabs)/` | [x] | Main tab navigation |
| `app/modals/` | [x] | Modal screens |
| `components/` | [x] | Reusable UI components |
| `components/ui/` | [x] | Base UI components |
| `components/restaurants/` | [x] | Restaurant-specific components |
| `components/reviews/` | [x] | Review-specific components |
| `lib/api/` | [x] | API client and endpoints |
| `lib/stores/` | [x] | Zustand stores |
| `lib/hooks/` | [x] | Custom React hooks |
| `lib/constants/` | [x] | App constants (colors, spacing, typography) |
| `lib/utils/` | [x] | Utility functions |
| `types/` | [x] | TypeScript type definitions |
| `docs/` | [x] | Documentation |

### 1.3 Constants Defined

| Constant File | Status | Contents |
|---------------|--------|----------|
| `colors.ts` | [x] | Color palette (primary, secondary, background, etc.) |
| `spacing.ts` | [x] | Spacing scale (xs, sm, md, lg, xl, xxl) |
| `typography.ts` | [x] | Font sizes and weights |
| `config.ts` | [x] | API URL, app configuration |

---

## 2. Authentication Module

### 2.1 Screens

| Screen | Status | File | Features |
|--------|--------|------|----------|
| Welcome Screen | [x] | `app/(auth)/welcome.tsx` | App logo, Login button, Create Account button, Tagline |
| Login Screen | [x] | `app/(auth)/login.tsx` | Email input, Password input, Login button, Forgot Password link |
| Register Screen | [x] | `app/(auth)/register.tsx` | Name fields, Email, Phone, Password, Province selector, Terms checkbox |
| Forgot Password Screen | [x] | `app/(auth)/forgot-password.tsx` | Email input, Send Reset Link, Success/error feedback |

### 2.2 Auth Infrastructure

| Feature | Status | File | Notes |
|---------|--------|------|-------|
| Auth store (Zustand) | [x] | `lib/stores/useAuthStore.ts` | User state, login/logout actions |
| useAuth hook | [x] | `lib/hooks/useAuth.ts` | Access auth state and actions |
| Token storage (SecureStore) | [x] | `lib/utils/storage.ts` | Secure token persistence |
| Auto-login on app start | [x] | `app/_layout.tsx` | Check stored token on mount |
| Form validation | [x] | `lib/utils/validators.ts` | Email, password, phone validation |
| Auth API endpoints | [x] | `lib/api/endpoints/auth.ts` | login, register, forgotPassword, getProfile |

### 2.3 Auth API Endpoints

| Endpoint | Status | Method | Path |
|----------|--------|--------|------|
| Login | [x] | POST | `/auth/login` |
| Register | [x] | POST | `/auth/register` |
| Forgot Password | [x] | POST | `/auth/forgot-password` |
| Get Profile | [x] | GET | `/users/profile` |
| Refresh Token | [x] | POST | `/auth/refresh` |

---

## 3. Navigation Setup

### 3.1 Navigation Structure

| Navigator | Status | File | Screens |
|-----------|--------|------|---------|
| Root Layout | [x] | `app/_layout.tsx` | Auth check, providers setup |
| Auth Stack | [x] | `app/(auth)/_layout.tsx` | Welcome, Login, Register, Forgot Password |
| Main Tab Navigator | [x] | `app/(tabs)/_layout.tsx` | Home, Eatlist, Profile tabs |
| Home Stack | [x] | `app/(tabs)/(home)/_layout.tsx` | Home, Search, Map, Restaurant, Review, User |
| Profile Stack | [x] | `app/(tabs)/profile/_layout.tsx` | Profile, Edit, Settings |
| Modals | [x] | `app/modals/_layout.tsx` | Filter, Create Review |

### 3.2 Route Configuration

| Route | Status | Type | Description |
|-------|--------|------|-------------|
| `/` | [x] | Index | Root redirect based on auth |
| `/(auth)/welcome` | [x] | Screen | Welcome/landing |
| `/(auth)/login` | [x] | Screen | User login |
| `/(auth)/register` | [x] | Screen | User registration |
| `/(auth)/forgot-password` | [x] | Screen | Password reset |
| `/(tabs)/(home)` | [x] | Tab | Home/discovery |
| `/(tabs)/(home)/search` | [x] | Screen | Search restaurants |
| `/(tabs)/(home)/map` | [x] | Screen | Map view |
| `/(tabs)/(home)/restaurant/[id]` | [x] | Dynamic | Restaurant detail |
| `/(tabs)/(home)/review/[id]` | [x] | Dynamic | Review detail |
| `/(tabs)/(home)/user/[id]` | [x] | Dynamic | Other user profile |
| `/(tabs)/eatlist` | [x] | Tab | User's eatlist |
| `/(tabs)/profile` | [x] | Tab | My profile |
| `/(tabs)/profile/edit` | [x] | Screen | Edit profile |
| `/(tabs)/profile/settings` | [x] | Screen | App settings |
| `/modals/filter` | [x] | Modal | Search filters |
| `/modals/create-review` | [x] | Modal | Write review |

---

## 4. Home Module

### 4.1 Home Screen

| Feature | Status | Notes |
|---------|--------|-------|
| Header with app logo | [x] | Custom header component |
| Search bar (navigates to Search) | [x] | Tappable search input |
| "Top Restaurants" horizontal scroll | [x] | RestaurantCard carousel |
| "Near You" section | [x] | Location-based restaurant list |
| "Recent Reviews" feed | [x] | ReviewCard list |
| Pull to refresh | [x] | FlatList refresh control |

**File**: `app/(tabs)/(home)/index.tsx`

### 4.2 Search Screen

| Feature | Status | Notes |
|---------|--------|-------|
| Search input (auto-focus) | [x] | TextInput with search icon |
| Recent searches section | [x] | Stored in search store |
| Search results list | [x] | Restaurant cards |
| "View on Map" toggle | [x] | Navigation to map screen |
| Filter button | [x] | Opens filter modal |

**File**: `app/(tabs)/(home)/search.tsx`

### 4.3 Filter Modal

| Feature | Status | Notes |
|---------|--------|-------|
| Food type multi-select | [x] | Checkbox list of food types |
| Distance slider | [x] | 1km - 50km range |
| Minimum rating selector | [x] | Star rating filter |
| Sort by options | [x] | Rating, Distance, Recent |
| "Apply Filters" button | [x] | Apply and close |
| "Clear All" button | [x] | Reset filters |

**File**: `app/modals/filter.tsx`

### 4.4 Map View Screen

| Feature | Status | Notes |
|---------|--------|-------|
| Full-screen map | [x] | react-native-maps |
| Restaurant markers | [x] | Custom markers |
| Current location indicator | [x] | User's location |
| Restaurant card on marker tap | [x] | Info callout |
| List view toggle | [x] | Switch to list view |
| Filter button | [x] | Opens filter modal |
| Search this area button | [x] | Re-search current map bounds |

**File**: `app/(tabs)/(home)/map.tsx`

---

## 5. Restaurant Module

### 5.1 Restaurant Detail Screen

| Feature | Status | Notes |
|---------|--------|-------|
| Hero image (carousel) | [x] | Photo carousel if multiple |
| Restaurant name and rating | [x] | Title with star rating |
| Food type tags | [x] | Badge components |
| Address with "Open in Maps" | [x] | Linking to native maps |
| Contact info (phone, website) | [x] | Tappable links |
| Operating hours | [x] | If available from API |
| "Add to Eatlist" button | [x] | Toggle add/remove |
| "Write Review" button | [x] | Opens create review modal |
| Reviews section | [x] | List of ReviewCards |
| Share button | [x] | Native share sheet |

**File**: `app/(tabs)/(home)/restaurant/[id].tsx`

### 5.2 Restaurant API Endpoints

| Endpoint | Status | Method | Path |
|----------|--------|--------|------|
| Get All Restaurants | [x] | GET | `/restaurants` |
| Get Restaurant by ID | [x] | GET | `/restaurants/:id` |
| Search Restaurants | [x] | GET | `/restaurants/search` |
| Get Nearby Restaurants | [x] | GET | `/restaurants/nearby` |
| Get Top Rated | [x] | GET | `/restaurants/top-rated` |
| Get Restaurant Reviews | [x] | GET | `/restaurants/:id/reviews` |

**File**: `lib/api/endpoints/restaurants.ts`

---

## 6. Review Module

### 6.1 Review Detail Screen

| Feature | Status | Notes |
|---------|--------|-------|
| User info (photo, name) | [x] | Tappable to view profile |
| Review date | [x] | Formatted date |
| Rating display (stars) | [x] | Read-only stars |
| Review text | [x] | Full review content |
| Review photo | [x] | If attached |
| Restaurant info card | [x] | Link to restaurant |
| Share button | [x] | Native share |

**File**: `app/(tabs)/(home)/review/[id].tsx`

### 6.2 Create Review Modal

| Feature | Status | Notes |
|---------|--------|-------|
| Rating input (stars) | [x] | Interactive star selector |
| Review text area | [x] | Multi-line input |
| Photo upload | [x] | Image picker integration |
| Submit button | [x] | API submission |
| Cancel button | [x] | Dismiss modal |

**File**: `app/modals/create-review.tsx`

### 6.3 Review API Endpoints

| Endpoint | Status | Method | Path |
|----------|--------|--------|------|
| Get Review by ID | [x] | GET | `/reviews/:id` |
| Create Review | [x] | POST | `/reviews` |
| Update Review | [x] | PUT | `/reviews/:id` |
| Delete Review | [x] | DELETE | `/reviews/:id` |
| Get User Reviews | [x] | GET | `/users/:id/reviews` |
| Get Recent Reviews | [x] | GET | `/reviews/recent` |

**File**: `lib/api/endpoints/reviews.ts`

---

## 7. Eatlist Module

### 7.1 Eatlist Screen

| Feature | Status | Notes |
|---------|--------|-------|
| Tab toggle (Want to Visit / Visited) | [x] | Segmented control |
| Restaurant cards list | [x] | FlatList of RestaurantCards |
| Quick action: Mark as visited | [x] | Swipe or button |
| Quick action: Remove | [x] | Swipe or button |
| Empty state with CTA | [x] | Prompt to discover |
| Sort options | [x] | Date added, Name, Rating |

**File**: `app/(tabs)/eatlist.tsx`

### 7.2 Eatlist Store

| Feature | Status | Notes |
|---------|--------|-------|
| Eatlist state | [x] | Want to visit + visited arrays |
| Add to eatlist action | [x] | Add restaurant |
| Remove from eatlist action | [x] | Remove restaurant |
| Mark as visited action | [x] | Move between lists |
| Fetch eatlist action | [x] | Load from API |

**File**: `lib/stores/useEatlistStore.ts`

### 7.3 Eatlist API Endpoints

| Endpoint | Status | Method | Path |
|----------|--------|--------|------|
| Get User Eatlist | [x] | GET | `/eatlist` |
| Add to Eatlist | [x] | POST | `/eatlist` |
| Remove from Eatlist | [x] | DELETE | `/eatlist/:restaurantId` |
| Mark as Visited | [x] | PUT | `/eatlist/:restaurantId/visited` |

**File**: `lib/api/endpoints/eatlist.ts`

---

## 8. Profile Module

### 8.1 My Profile Screen

| Feature | Status | Notes |
|---------|--------|-------|
| Profile photo | [x] | Tappable to change |
| Name and username | [x] | Display name |
| Bio | [x] | User bio text |
| Province/Location | [x] | User's region |
| Stats (Reviews, Eatlist) | [x] | Count displays |
| Top 4 restaurants section | [x] | User's favorites |
| "Edit Profile" button | [x] | Navigate to edit |
| My reviews section | [x] | User's reviews list |
| Settings gear icon | [x] | Navigate to settings |

**File**: `app/(tabs)/profile/index.tsx`

### 8.2 Edit Profile Screen

| Feature | Status | Notes |
|---------|--------|-------|
| Profile photo picker | [x] | Image picker |
| Name fields | [x] | First, last names |
| Bio text area | [x] | Multi-line input |
| Province selector | [x] | Dropdown/picker |
| Phone number | [x] | Phone input |
| "Save Changes" button | [x] | Submit to API |

**File**: `app/(tabs)/profile/edit.tsx`

### 8.3 User Profile Screen (Other Users)

| Feature | Status | Notes |
|---------|--------|-------|
| Profile photo | [x] | Display only |
| Name | [x] | Display name |
| Bio | [x] | User bio |
| Province | [x] | Location |
| Top 4 restaurants | [x] | User's favorites |
| User's reviews | [x] | Review list |

**File**: `app/(tabs)/(home)/user/[id].tsx`

### 8.4 Settings Screen

| Feature | Status | Notes |
|---------|--------|-------|
| Account section | [x] | Change password link |
| Email preferences | [x] | Toggle settings |
| Privacy section | [x] | Profile visibility |
| App section | [x] | Language, cache, about |
| Logout button | [x] | Clear auth and redirect |
| Delete account | [x] | Account deletion option |

**File**: `app/(tabs)/profile/settings.tsx`

### 8.5 User API Endpoints

| Endpoint | Status | Method | Path |
|----------|--------|--------|------|
| Get Profile | [x] | GET | `/users/profile` |
| Update Profile | [x] | PUT | `/users/profile` |
| Get User by ID | [x] | GET | `/users/:id` |
| Upload Photo | [x] | POST | `/users/profile/photo` |
| Get User Stats | [x] | GET | `/users/:id/stats` |
| Get User Top 4 | [x] | GET | `/users/:id/top-restaurants` |
| Change Password | [x] | PUT | `/users/password` |
| Delete Account | [x] | DELETE | `/users/profile` |

**File**: `lib/api/endpoints/users.ts`

---

## 9. UI Components

### 9.1 Common Components

| Component | Status | File | Features |
|-----------|--------|------|----------|
| Button | [x] | `components/ui/Button.tsx` | Primary, Secondary, Outline variants; sizes; loading state |
| Input | [x] | `components/ui/Input.tsx` | Text input with label, error states, icons |
| Card | [x] | `components/ui/Card.tsx` | Base card with shadow |
| Avatar | [x] | `components/ui/Avatar.tsx` | User profile photo, size variants |
| Rating | [x] | `components/ui/Rating.tsx` | Star rating display/input |
| Badge | [x] | `components/ui/Badge.tsx` | Tags and labels |
| Loading | [x] | `components/ui/Loading.tsx` | Loading spinner |
| EmptyState | [x] | `components/ui/EmptyState.tsx` | Empty list placeholder with CTA |

### 9.2 Restaurant Components

| Component | Status | File | Features |
|-----------|--------|------|----------|
| RestaurantCard | [x] | `components/restaurants/RestaurantCard.tsx` | Compact preview with photo, name, rating, food types |

### 9.3 Review Components

| Component | Status | File | Features |
|-----------|--------|------|----------|
| ReviewCard | [x] | `components/reviews/ReviewCard.tsx` | Review preview with user, rating, text snippet |

### 9.4 Pending Components (Nice-to-have)

| Component | Status | Notes |
|-----------|--------|-------|
| Toast | [ ] | Success/error notifications (using Alert for now) |
| ErrorState | [ ] | Error display with retry (using EmptyState variant) |
| RestaurantListItem | [ ] | List row variant (using RestaurantCard) |
| RestaurantHero | [ ] | Detail header (inline in screen) |
| FoodTypeTag | [ ] | Food category chip (using Badge) |
| RestaurantMarker | [ ] | Map marker (using default markers) |

---

## 10. Custom Hooks

| Hook | Status | File | Purpose |
|------|--------|------|---------|
| useAuth | [x] | `lib/hooks/useAuth.ts` | Access auth state and actions |
| useImagePicker | [x] | `lib/hooks/useImagePicker.ts` | Image selection utility |
| useLocation | [x] | `lib/hooks/useLocation.ts` | Device location access |
| useRestaurantSearch | [x] | `lib/hooks/useRestaurantSearch.ts` | Search with debounce |

---

## 11. Zustand Stores

| Store | Status | File | State |
|-------|--------|------|-------|
| useAuthStore | [x] | `lib/stores/useAuthStore.ts` | user, token, isAuthenticated, loading |
| useEatlistStore | [x] | `lib/stores/useEatlistStore.ts` | wantToVisit, visited, loading |
| useSearchStore | [x] | `lib/stores/useSearchStore.ts` | query, filters, results, recentSearches |

---

## 12. Utility Functions

| Utility | Status | File | Functions |
|---------|--------|------|-----------|
| Validators | [x] | `lib/utils/validators.ts` | validateEmail, validatePassword, validatePhone |
| Formatters | [x] | `lib/utils/formatters.ts` | formatDate, formatDistance, formatRating |
| Mappers | [x] | `lib/utils/mappers.ts` | API response to app models |
| Storage | [x] | `lib/utils/storage.ts` | SecureStore helpers |

---

## 13. API Integration Summary

### 13.1 Endpoint Files

| File | Status | Endpoints Count |
|------|--------|-----------------|
| `lib/api/endpoints/auth.ts` | [x] | 5 endpoints |
| `lib/api/endpoints/users.ts` | [x] | 8 endpoints |
| `lib/api/endpoints/restaurants.ts` | [x] | 6 endpoints |
| `lib/api/endpoints/reviews.ts` | [x] | 6 endpoints |
| `lib/api/endpoints/eatlist.ts` | [x] | 4 endpoints |
| `lib/api/endpoints/food-types.ts` | [x] | 2 endpoints |

**Total**: 31 API endpoints integrated

### 13.2 API Client Features

| Feature | Status | Notes |
|---------|--------|-------|
| Base URL configuration | [x] | From environment |
| Request interceptor (auth token) | [x] | Auto-attach Bearer token |
| Response interceptor (401 handling) | [x] | Auto-logout on unauthorized |
| Error handling | [x] | Standardized error format |
| Timeout configuration | [x] | 10 second default |

---

## 14. Phase 1 Completion Summary

### Overall Status: **COMPLETE**

| Module | Status | Completion |
|--------|--------|------------|
| Project Setup | [x] | 100% |
| Authentication | [x] | 100% |
| Navigation | [x] | 100% |
| Home/Discovery | [x] | 100% |
| Search | [x] | 100% |
| Restaurant | [x] | 100% |
| Review | [x] | 100% |
| Eatlist | [x] | 100% |
| Profile | [x] | 100% |
| UI Components | [x] | 100% (core) |
| API Integration | [x] | 100% |

### Files Created

| Category | Count |
|----------|-------|
| Screens (`.tsx` in `app/`) | 17 |
| Layout files (`_layout.tsx`) | 6 |
| UI Components | 10 |
| Domain Components | 2 |
| API Endpoint files | 6 |
| Zustand Stores | 3 |
| Custom Hooks | 4 |
| Utility files | 5 |
| Constant files | 4 |

---

## 15. Known Gaps & Edge Cases

### Minor Gaps (Non-blocking)

| Gap | Priority | Notes |
|-----|----------|-------|
| Toast notifications | Low | Using Alert API as fallback |
| Skeleton loading | Low | Using Loading spinner |
| Deep linking | Low | Basic routing works, advanced deep links pending |
| Offline mode | Low | Deferred to future phase |

### Edge Cases Handled

| Case | Status | Solution |
|------|--------|----------|
| Auth token expiry | [x] | 401 interceptor clears token |
| Empty search results | [x] | EmptyState component |
| No location permission | [x] | Graceful fallback with prompt |
| Image upload failure | [x] | Error feedback to user |
| Network errors | [x] | Try-catch with user feedback |

---

## 16. Testing Checklist

### Manual Testing Required

| Flow | Tested |
|------|--------|
| Register new user | [ ] |
| Login existing user | [ ] |
| Forgot password flow | [ ] |
| Browse home feed | [ ] |
| Search restaurants | [ ] |
| Apply filters | [ ] |
| View restaurant details | [ ] |
| Add to eatlist | [ ] |
| Remove from eatlist | [ ] |
| Mark as visited | [ ] |
| Write a review | [ ] |
| View review details | [ ] |
| Edit profile | [ ] |
| Change profile photo | [ ] |
| Logout | [ ] |
| Map view navigation | [ ] |

---

## 17. Next Phase (Phase 2) Preview

The following features are planned for Phase 2:

- [ ] Follow/Unfollow system
- [ ] Followers/Following screens
- [ ] Block user functionality
- [ ] Review likes/saves
- [ ] Custom lists (beyond eatlist)
- [ ] Collaborative lists
- [ ] List sharing
- [ ] Push notifications setup

---

## Document History

| Date | Author | Changes |
|------|--------|---------|
| Feb 2025 | AI Assistant | Initial Phase 1 planning document created |

---

*This document should be updated as features are added or modified.*

# Bokitas - Mobile Development Guide

This document outlines the mobile application architecture, screens, components, and development roadmap for the Bokitas app.

## Tech Stack

*TBD*

---

## Navigation Structure

```
App
|
+-- Auth Stack (Unauthenticated)
|   +-- Welcome Screen
|   +-- Login Screen
|   +-- Register Screen
|   +-- Forgot Password Screen
|
+-- Main Stack (Authenticated)
    |
    +-- Bottom Tab Navigator
    |   |
    |   +-- Home Tab
    |   |   +-- Home Screen (Discovery)
    |   |   +-- Restaurant Detail Screen
    |   |   +-- Review Detail Screen
    |   |   +-- User Profile Screen (other users)
    |   |
    |   +-- Search Tab
    |   |   +-- Search Screen
    |   |   +-- Filter Modal
    |   |   +-- Map View Screen
    |   |
    |   +-- Eatlist Tab
    |   |   +-- Eatlist Screen
    |   |
    |   +-- Lists Tab (Phase 2)
    |   |   +-- My Lists Screen
    |   |   +-- List Detail Screen
    |   |   +-- Create/Edit List Screen
    |   |
    |   +-- Profile Tab
    |       +-- My Profile Screen
    |       +-- Edit Profile Screen
    |       +-- Settings Screen
    |       +-- Followers Screen (Phase 2)
    |       +-- Following Screen (Phase 2)
    |
    +-- Modals
        +-- Create Review Modal
        +-- Add to List Modal (Phase 2)
        +-- Share Modal (Phase 2)
```

---

## Screens by Module

### Authentication Screens

#### Welcome Screen
- App logo and branding
- "Login" button
- "Create Account" button
- Brief app description/tagline

#### Login Screen
- Email input field
- Password input field
- "Login" button
- "Forgot Password?" link
- "Create Account" link
- Social login buttons (future)

#### Register Screen
- First name input
- First last name input
- Second last name input (optional)
- Email input
- Phone input (optional)
- Password input
- Confirm password input
- Province/Region selector
- Terms & conditions checkbox
- "Create Account" button

#### Forgot Password Screen
- Email input
- "Send Reset Link" button
- Success/error feedback
- Back to login link

---

### Home / Discovery Screens

#### Home Screen
- Header with app logo and notifications icon
- Search bar (navigates to Search Screen)
- "Top Restaurants" horizontal scroll section
- "Near You" section with restaurant cards
- "Recent Reviews" feed section
- Pull to refresh

#### Restaurant Detail Screen
- Hero image (carousel if multiple photos)
- Restaurant name and rating
- Food type tags
- Address with "Open in Maps" button
- Contact info (phone, website)
- Operating hours (if available)
- "Add to Eatlist" button
- "Write Review" button
- Reviews section (sorted by recent/helpful)
- "Add to List" button (Phase 2)
- Share button

#### Review Detail Screen
- User info (photo, name, tap to view profile)
- Review date
- Rating display (stars)
- Review text
- Review photo (if any)
- Restaurant info card
- Like button (Phase 2)
- Save button (Phase 2)
- Share button

---

### Search Screens

#### Search Screen
- Search input field (auto-focus)
- Recent searches section
- Search results list
- "View on Map" toggle button
- Filter button (opens Filter Modal)

#### Filter Modal
- Food type multi-select
- Distance slider (1km - 50km)
- Minimum rating selector
- Sort by options (Rating, Distance, Recent)
- "Apply Filters" button
- "Clear All" button

#### Map View Screen
- Full-screen map (react-native-maps)
- Restaurant markers
- Current location indicator
- Restaurant card on marker tap
- List view toggle
- Filter button
- Search this area button

---

### Eatlist Screens

#### Eatlist Screen
- Tab toggle: "Want to Visit" / "Visited"
- Restaurant cards list
- Quick actions: Mark as visited, Remove
- Empty state with CTA to discover restaurants
- Sort options (Date added, Name, Rating)

---

### Profile Screens

#### My Profile Screen
- Profile photo (tap to change)
- Name and username
- Bio
- Province/Location
- Stats: Reviews count, Eatlist count, Lists count
- Top 4 restaurants section
- "Edit Profile" button
- My reviews section
- Settings gear icon

#### Edit Profile Screen
- Profile photo picker
- Name fields
- Bio text area
- Province selector
- Phone number
- "Save Changes" button

#### User Profile Screen (Other Users)
- Profile photo
- Name
- Bio
- Province
- Stats: Reviews, Followers, Following (Phase 2)
- Follow/Unfollow button (Phase 2)
- Block option in menu (Phase 2)
- Top 4 restaurants
- User's reviews
- User's public lists (Phase 2)

#### Settings Screen
- Account section
  - Change password
  - Email preferences
  - Push notifications toggle (Phase 3)
- Privacy section
  - Blocked users (Phase 2)
  - Profile visibility
- App section
  - Language preference
  - Clear cache
  - About
- Logout button
- Delete account

---

### Lists Screens (Phase 2)

#### My Lists Screen
- "Create New List" button
- My Lists section
- Shared with Me section
- List cards with: name, item count, privacy badge

#### List Detail Screen
- List name and description
- Privacy/Collaborative badges
- Member avatars (if collaborative)
- Restaurant items with notes
- Reorder functionality
- "Add Restaurant" button
- Share button
- Edit/Delete options (if owner)

#### Create/Edit List Screen
- List name input
- Description input
- Privacy toggle (Public/Private)
- Collaborative toggle
- Save button

---

### Social Screens (Phase 2)

#### Followers Screen
- List of follower users
- Follow back button
- Search/filter followers

#### Following Screen
- List of followed users
- Unfollow button
- Search/filter following

#### Feed Screen (Optional - could be part of Home)
- Reviews from followed users
- Chronological or algorithmic sorting

---

### Notification Screen (Phase 3)

#### Notifications Screen
- Notification list
- Types: New follower, List invite, Review like, etc.
- Mark as read functionality
- Tap to navigate to relevant screen

---

## Core Components

### Common Components
- [ ] `Button` - Primary, Secondary, Outline variants
- [ ] `Input` - Text input with label, error states
- [ ] `Card` - Base card component with shadow
- [ ] `Avatar` - User profile photo component
- [ ] `Rating` - Star rating display/input
- [ ] `Badge` - Tags and labels
- [ ] `Modal` - Base modal component
- [ ] `LoadingSpinner` - Loading indicator
- [ ] `EmptyState` - Empty list placeholder
- [ ] `ErrorState` - Error display with retry
- [ ] `Toast` - Success/error notifications

### Restaurant Components
- [ ] `RestaurantCard` - Compact restaurant preview
- [ ] `RestaurantListItem` - List row variant
- [ ] `RestaurantHero` - Detail screen header
- [ ] `FoodTypeTag` - Food category chip
- [ ] `RestaurantMarker` - Map marker component

### Review Components
- [ ] `ReviewCard` - Review preview
- [ ] `ReviewForm` - Create/edit review form
- [ ] `RatingInput` - Interactive star rating

### User Components
- [ ] `UserCard` - User preview (followers list)
- [ ] `UserAvatar` - Photo with online indicator
- [ ] `FollowButton` - Follow/unfollow toggle

### List Components (Phase 2)
- [ ] `ListCard` - List preview
- [ ] `ListItem` - Restaurant in list
- [ ] `MemberAvatar` - Collaborative list member

---

## Development Roadmap

### Phase 1 - Core MVP

#### Project Setup
- [ ] Initialize Expo project
- [ ] Set up navigation (React Navigation)
- [ ] Configure environment variables
- [ ] Set up API client (axios/fetch)
- [ ] Configure state management (Context/Zustand/Redux)
- [ ] Set up Supabase client
- [ ] Configure react-native-maps
- [ ] Set up image picker

#### Authentication Screens
- [ ] Create Welcome screen
- [ ] Create Login screen
- [ ] Create Register screen
- [ ] Create Forgot Password screen
- [ ] Implement auth context/state
- [ ] Implement token storage (SecureStore)
- [ ] Implement auto-login on app start
- [ ] Add form validation

#### Navigation Setup
- [ ] Configure Auth Stack
- [ ] Configure Main Tab Navigator
- [ ] Configure nested navigators
- [ ] Implement deep linking (basic)

#### Home Module
- [ ] Create Home screen layout
- [ ] Implement Top Restaurants section
- [ ] Implement Near You section
- [ ] Implement Recent Reviews section
- [ ] Create RestaurantCard component
- [ ] Create ReviewCard component
- [ ] Implement pull to refresh

#### Search Module
- [ ] Create Search screen
- [ ] Implement search functionality
- [ ] Create Filter Modal
- [ ] Implement filter logic
- [ ] Create Map View screen
- [ ] Implement restaurant markers
- [ ] Create RestaurantMarker component

#### Restaurant Module
- [ ] Create Restaurant Detail screen
- [ ] Implement photo carousel
- [ ] Display restaurant info
- [ ] Implement "Open in Maps" functionality
- [ ] Display reviews list
- [ ] Implement "Add to Eatlist" action

#### Review Module
- [ ] Create Review Detail screen
- [ ] Create Review Form modal
- [ ] Implement rating input
- [ ] Implement photo upload
- [ ] Implement review submission

#### Eatlist Module
- [ ] Create Eatlist screen
- [ ] Implement tab toggle (Want/Visited)
- [ ] Implement add to eatlist
- [ ] Implement remove from eatlist
- [ ] Implement mark as visited

#### Profile Module
- [ ] Create My Profile screen
- [ ] Create Edit Profile screen
- [ ] Implement profile photo upload
- [ ] Display user stats
- [ ] Display user reviews
- [ ] Implement Top 4 restaurants
- [ ] Create Settings screen
- [ ] Implement logout

#### Common Components
- [ ] Build Button component
- [ ] Build Input component
- [ ] Build Card component
- [ ] Build Avatar component
- [ ] Build Rating component
- [ ] Build LoadingSpinner component
- [ ] Build EmptyState component
- [ ] Build Toast notifications

---

### Phase 2 - Social Features

#### Follow System
- [ ] Implement Follow button component
- [ ] Create Followers screen
- [ ] Create Following screen
- [ ] Add follow/unfollow functionality
- [ ] Update profile to show follow counts
- [ ] Add "Follow" button to User Profile screen

#### Block System
- [ ] Add block option to User Profile
- [ ] Create Blocked Users screen in Settings
- [ ] Implement block/unblock functionality
- [ ] Filter blocked users from all views

#### Review Social Features
- [ ] Add Like button to reviews
- [ ] Add Save button to reviews
- [ ] Create Saved Reviews screen
- [ ] Implement review feed from followed users

#### Lists Module
- [ ] Create My Lists screen
- [ ] Create List Detail screen
- [ ] Create Create/Edit List screen
- [ ] Implement list CRUD operations
- [ ] Implement add/remove restaurants from list
- [ ] Implement list item reordering
- [ ] Create Add to List modal
- [ ] Implement list sharing (link generation)
- [ ] Implement join list via link
- [ ] Implement collaborative list members

#### Favorite Dishes
- [ ] Add favorite dish to reviews
- [ ] Display popular dishes on restaurant

---

### Phase 3 - Advanced Features

#### Push Notifications
- [ ] Configure Expo Push Notifications
- [ ] Implement push token registration
- [ ] Create Notifications screen
- [ ] Handle notification taps (deep linking)
- [ ] Add notification preferences in Settings

#### Achievements
- [ ] Create Achievements screen
- [ ] Display badges on profile
- [ ] Show achievement unlock animations

#### Calendar Integration
- [ ] Implement "Add to Calendar" feature
- [ ] Create dining events functionality

---

## External Integrations

### react-native-maps

**Setup:**
1. Install react-native-maps package
2. Configure Google Maps API key for Android
3. Configure for iOS (uses Apple Maps by default or Google Maps)

**Key features to implement:**
- Display restaurant markers
- User location tracking
- Marker clustering for dense areas
- Custom marker designs
- Info window on marker tap

### Expo Push Notifications (Phase 3)

**Setup:**
1. Configure Expo push notification credentials
2. Request notification permissions
3. Register push token with backend

**Notification types:**
- New follower
- List invitation
- Review liked
- Restaurant recommendations

### Supabase Client

**Setup:**
1. Install @supabase/supabase-js
2. Configure with project URL and anon key
3. Use for direct storage uploads

---

## Suggestions

### UX Enhancements
- [ ] **Onboarding Flow**: First-time user walkthrough highlighting key features
- [ ] **Skeleton Loading**: Show skeleton screens instead of spinners
- [ ] **Pull to Refresh**: Implement on all list screens
- [ ] **Infinite Scroll**: Paginated loading for long lists
- [ ] **Haptic Feedback**: Add subtle haptics for interactions
- [ ] **Gesture Navigation**: Swipe actions on list items

### Offline Support
- [ ] **Offline Mode**: Cache viewed restaurants and reviews
- [ ] **Offline Eatlist**: Access eatlist without internet
- [ ] **Queue Actions**: Queue actions when offline, sync when online
- [ ] **Download Lists**: Allow downloading lists for offline access

### Visual Enhancements
- [ ] **Dark Mode**: System-aware dark theme
- [ ] **Animations**: Smooth transitions between screens
- [ ] **Image Gallery**: Full-screen photo viewer with zoom
- [ ] **Custom Map Styles**: Branded map appearance

### Social Features
- [ ] **Share to Social Media**: Share reviews/restaurants to Instagram, WhatsApp
- [ ] **Deep Linking**: Share links that open specific content in app
- [ ] **Stories-like Feature**: Temporary posts about dining experiences
- [ ] **Check-in Feature**: Quick "I'm here" posts

### Discovery Features
- [ ] **Location-based Alerts**: "You're near a restaurant on your eatlist!"
- [ ] **Recommendations**: "Based on your taste..." suggestions
- [ ] **Trending Section**: Popular restaurants this week
- [ ] **Random Pick**: "Surprise me" feature for indecisive moments

### Accessibility
- [ ] **Screen Reader Support**: Full VoiceOver/TalkBack compatibility
- [ ] **Dynamic Font Sizes**: Support system font scaling
- [ ] **High Contrast Mode**: For visually impaired users
- [ ] **Reduce Motion**: Option to disable animations

### Performance
- [ ] **Image Optimization**: Lazy loading, progressive images
- [ ] **Memory Management**: Proper cleanup of large lists
- [ ] **Bundle Optimization**: Code splitting, tree shaking
- [ ] **Startup Time**: Minimize cold start time

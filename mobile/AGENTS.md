# CLAUDE.md — Mobile Development Standards (React Native / Expo)

> **Purpose**: Standardize AI-assisted mobile development using Claude Code, Open Code, and Cursor.
> 
> **Scope**: This document applies to the `/mobile` directory of the monorepo. Backend standards are maintained separately in `/backend`.

---

## Tech Stack

- **Framework**: React Native + Expo (SDK 50+)
- **Language**: TypeScript (strict mode)
- **Navigation**: Expo Router (file-based routing)
- **Styling**: StyleSheet + NativeWind (Tailwind for RN) - optional
- **State Management**: React Context + Hooks (or Zustand for complex state)
- **HTTP Client**: Axios
- **Storage**: AsyncStorage / Expo SecureStore
- **Notifications**: Expo Notifications
- **Icons**: Expo Vector Icons

---

## Monorepo Structure

```
project-root/
├── mobile/                # This document applies here
│   ├── app/
│   ├── components/
│   ├── lib/
│   ├── assets/
│   ├── docs/
│   ├── CLAUDE.md
│   └── ...
├── backend/               # Separate standards
│   └── ...
└── README.md
```

---

## Mobile Project Structure

```
mobile/
├── app/                             # Expo Router screens (file-based routing)
│   ├── _layout.tsx                  # Root layout (providers, navigation config)
│   ├── index.tsx                    # Home / Entry screen
│   ├── (auth)/                      # Auth group (unauthenticated routes)
│   │   ├── _layout.tsx
│   │   ├── login.tsx
│   │   └── register.tsx
│   ├── (tabs)/                      # Tab navigation group
│   │   ├── _layout.tsx              # Tab bar configuration
│   │   ├── home.tsx
│   │   ├── profile.tsx
│   │   └── settings.tsx
│   └── [id].tsx                     # Dynamic route example
│
├── components/
│   └── [ComponentName]/
│       ├── ComponentName.tsx
│       ├── ComponentName.types.ts   # Props interface
│       └── ComponentName.styles.ts  # StyleSheet (if complex)
│
├── lib/
│   ├── api/                         # API client for backend communication
│   │   ├── client.ts                # Axios instance configuration
│   │   └── endpoints/               # Grouped API calls
│   │       ├── auth.ts
│   │       ├── users.ts
│   │       └── expenses.ts
│   ├── hooks/                       # Custom React hooks
│   │   ├── useAuth.ts
│   │   └── useStorage.ts
│   ├── context/                     # React Context providers
│   │   ├── AuthContext.tsx
│   │   └── ThemeContext.tsx
│   ├── utils/                       # Helper functions
│   │   ├── formatDate.ts
│   │   └── formatCurrency.ts
│   └── constants/                   # App constants
│       ├── colors.ts
│       ├── spacing.ts
│       └── config.ts
│
├── types/
│   └── index.ts                     # Shared type definitions
│
├── assets/
│   ├── images/
│   └── fonts/
│
├── docs/
│   ├── components/                  # Component documentation
│   ├── screens/                     # Screen documentation
│   ├── utils/                       # Utility documentation
│   └── postmortem/                  # Issue tracking
│
├── app.json                         # Expo configuration
├── eas.json                         # EAS Build configuration
├── tsconfig.json
├── .env.local                       # Local environment (git ignored)
├── .env.example                     # Environment template (committed)
└── CLAUDE.md
```

---

## Conventions

### Components (components/[ComponentName]/)

Each component follows a **folder structure** with co-located files:

```typescript
// components/Button/Button.types.ts
export interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
}
```

```typescript
// components/Button/Button.styles.ts
import { StyleSheet } from 'react-native';
import { colors, spacing } from '@/lib/constants';

export const styles = StyleSheet.create({
  button: {
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  sm: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  md: {
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  lg: {
    paddingVertical: spacing.lg,
    paddingHorizontal: spacing.xl,
  },
  label: {
    fontWeight: '600',
  },
  primaryLabel: {
    color: '#FFFFFF',
  },
  secondaryLabel: {
    color: '#FFFFFF',
  },
  outlineLabel: {
    color: colors.primary,
  },
  disabled: {
    opacity: 0.5,
  },
});
```

```typescript
// components/Button/Button.tsx
import { TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import { ButtonProps } from './Button.types';
import { styles } from './Button.styles';

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
}: ButtonProps) {
  return (
    <TouchableOpacity
      style={[
        styles.button,
        styles[variant],
        styles[size],
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'outline' ? styles.outlineLabel.color : '#FFFFFF'} />
      ) : (
        <Text style={[styles.label, styles[`${variant}Label`]]}>
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}
```

**Component conventions:**
- One component per folder with co-located files
- Props interface in separate `.types.ts` file
- Styles in separate `.styles.ts` file (for complex components)
- Named exports preferred over default exports
- Use `@/` path alias for imports

### Screens (app/)

Expo Router uses file-based routing:

```typescript
// app/(tabs)/home.tsx
import { View, Text, FlatList } from 'react-native';
import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { expensesApi } from '@/lib/api/endpoints/expenses';
import { useAuth } from '@/lib/hooks/useAuth';
import { ExpenseCard } from '@/components/ExpenseCard';
import { styles } from './home.styles';

export default function HomeScreen() {
  const { user } = useAuth();
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadExpenses();
  }, []);

  const loadExpenses = async () => {
    try {
      setLoading(true);
      const data = await expensesApi.getAll(user.email);
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Home' }} />
      
      <FlatList
        data={expenses}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ExpenseCard expense={item} />}
        refreshing={loading}
        onRefresh={loadExpenses}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No expenses found</Text>
        }
      />
    </View>
  );
}
```

**Screen conventions:**
- Default export for screen components (required by Expo Router)
- Use `Stack.Screen` for screen-specific options
- Handle loading and error states
- Use `FlatList` for lists (not `ScrollView` with `.map()`)

### Layouts (app/_layout.tsx)

```typescript
// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { AuthProvider } from '@/lib/context/AuthContext';
import { ThemeProvider } from '@/lib/context/ThemeContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StatusBar style="auto" />
        <Stack>
          <Stack.Screen name="(auth)" options={{ headerShown: false }} />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        </Stack>
      </AuthProvider>
    </ThemeProvider>
  );
}
```

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/lib/constants';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.gray,
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
```

### API Layer (lib/api/)

```typescript
// lib/api/client.ts
import axios from 'axios';
import * as SecureStore from 'expo-secure-store';
import { API_URL } from '@/lib/constants/config';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized - clear token and redirect to login
      await SecureStore.deleteItemAsync('authToken');
      // Navigation to login handled by AuthContext
    }
    return Promise.reject(error);
  }
);
```

```typescript
// lib/api/endpoints/expenses.ts
import { api } from '../client';
import { Expense, CreateExpensePayload } from '@/types';

export const expensesApi = {
  getAll: async (email: string): Promise<Expense[]> => {
    const response = await api.get<Expense[]>(`/expenses/${email}`);
    return response.data;
  },

  getById: async (id: string, email: string): Promise<Expense> => {
    const response = await api.get<Expense>(`/expenses/single/${id}`, {
      params: { email },
    });
    return response.data;
  },

  create: async (data: CreateExpensePayload): Promise<Expense> => {
    const response = await api.post<Expense>('/expenses', data);
    return response.data;
  },

  update: async (id: string, data: Partial<CreateExpensePayload>): Promise<void> => {
    await api.put(`/expenses/${id}`, data);
  },

  delete: async (id: string, email: string): Promise<void> => {
    await api.delete(`/expenses/${id}`, { data: { email } });
  },
};
```

**API conventions:**
- Centralized Axios instance with interceptors
- Use `expo-secure-store` for sensitive data (tokens)
- Group endpoints by domain
- Type all request/response data
- Handle 401 errors globally

### Hooks (lib/hooks/)

```typescript
// lib/hooks/useAuth.ts
import { useContext } from 'react';
import { AuthContext } from '@/lib/context/AuthContext';

export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  
  return context;
}
```

```typescript
// lib/hooks/useStorage.ts
import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export function useStorage<T>(key: string, initialValue: T) {
  const [value, setValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadValue();
  }, []);

  const loadValue = async () => {
    try {
      const stored = await AsyncStorage.getItem(key);
      if (stored !== null) {
        setValue(JSON.parse(stored));
      }
    } catch (error) {
      console.error('Error loading from storage:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateValue = useCallback(async (newValue: T) => {
    try {
      setValue(newValue);
      await AsyncStorage.setItem(key, JSON.stringify(newValue));
    } catch (error) {
      console.error('Error saving to storage:', error);
    }
  }, [key]);

  const removeValue = useCallback(async () => {
    try {
      setValue(initialValue);
      await AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing from storage:', error);
    }
  }, [key, initialValue]);

  return { value, setValue: updateValue, removeValue, loading };
}
```

### Context (lib/context/)

```typescript
// lib/context/AuthContext.tsx
import { createContext, useState, useEffect, ReactNode } from 'react';
import { useRouter, useSegments } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { authApi } from '@/lib/api/endpoints/auth';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  // Check auth state on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Protect routes based on auth state
  useEffect(() => {
    if (loading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!user && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (user && inAuthGroup) {
      // Redirect to home if authenticated
      router.replace('/(tabs)/home');
    }
  }, [user, loading, segments]);

  const checkAuth = async () => {
    try {
      const token = await SecureStore.getItemAsync('authToken');
      if (token) {
        const userData = await authApi.getProfile();
        setUser(userData);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      await SecureStore.deleteItemAsync('authToken');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string) => {
    const { token, user: userData } = await authApi.login(email, password);
    await SecureStore.setItemAsync('authToken', token);
    setUser(userData);
  };

  const logout = async () => {
    await SecureStore.deleteItemAsync('authToken');
    setUser(null);
  };

  const register = async (data: RegisterData) => {
    await authApi.register(data);
    await login(data.email, data.password);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  );
}
```

### Constants (lib/constants/)

```typescript
// lib/constants/colors.ts
export const colors = {
  primary: '#007AFF',
  secondary: '#5856D6',
  success: '#34C759',
  warning: '#FF9500',
  error: '#FF3B30',
  
  background: '#F2F2F7',
  surface: '#FFFFFF',
  
  text: '#000000',
  textSecondary: '#8E8E93',
  
  gray: '#8E8E93',
  grayLight: '#C7C7CC',
  grayDark: '#48484A',
  
  border: '#C6C6C8',
};
```

```typescript
// lib/constants/spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
};
```

```typescript
// lib/constants/config.ts
import Constants from 'expo-constants';

export const API_URL = Constants.expoConfig?.extra?.apiUrl || 'http://localhost:3000';
export const APP_NAME = 'MyApp';
```

### Types (types/index.ts)

```typescript
// types/index.ts
export interface User {
  id: string;
  email: string;
  name: string;
  lastName: string;
}

export interface Expense {
  id: string;
  description: string;
  amount: number;
  date: string;
  categoryId: number;
  userId: string;
  active: boolean;
}

export interface CreateExpensePayload {
  email: string;
  amount: number;
  description: string;
  category: number;
}

export interface Category {
  id: number;
  description: string;
}

export interface ApiError {
  message: string;
  status: number;
}
```

---

## Styling Guidelines

### Option 1: StyleSheet (Default)

```typescript
import { StyleSheet } from 'react-native';
import { colors, spacing } from '@/lib/constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.md,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.text,
    marginBottom: spacing.md,
  },
});
```

### Option 2: NativeWind (Tailwind for RN)

```typescript
// If using NativeWind
import { View, Text } from 'react-native';

export function Card({ children }) {
  return (
    <View className="bg-white rounded-lg p-4 shadow-sm">
      <Text className="text-lg font-bold text-gray-900">
        {children}
      </Text>
    </View>
  );
}
```

**Styling conventions:**
- Use `StyleSheet.create()` for type safety and performance
- Define colors and spacing in constants
- Avoid inline styles for repeated values
- Use consistent naming: `container`, `title`, `label`, `button`, etc.

---

## File Naming Conventions

| Type | Convention | Example |
|------|------------|---------|
| Components | PascalCase folder + files | `Button/Button.tsx` |
| Screens | lowercase (Expo Router) | `home.tsx`, `profile.tsx` |
| Hooks | camelCase with `use` prefix | `useAuth.ts` |
| Utils | camelCase | `formatDate.ts` |
| Types | camelCase or PascalCase | `index.ts` |
| Constants | camelCase | `colors.ts`, `config.ts` |
| API endpoints | camelCase | `expenses.ts` |
| Layouts | `_layout.tsx` | `app/_layout.tsx` |

---

## Documentation Requirements

### Component Docs (`docs/components/COMPONENTNAME.md`)

```markdown
# ComponentName

Brief description of what this component does.

## Props

| Prop | Type | Required | Default | Description |
|------|------|----------|---------|-------------|
| label | string | yes | - | Button text |
| variant | 'primary' \| 'secondary' | no | 'primary' | Visual style |
| onPress | () => void | yes | - | Press handler |

## Usage

\`\`\`tsx
import { Button } from '@/components/Button';

<Button 
  label="Save" 
  onPress={() => handleSave()} 
  variant="primary"
/>
\`\`\`

## Platform Notes

- iOS: Uses haptic feedback on press
- Android: Uses ripple effect
```

### Screen Docs (`docs/screens/SCREENNAME.md`)

```markdown
# Home Screen

Main dashboard showing user's expenses summary.

## Route

`/(tabs)/home`

## Features

- Displays list of recent expenses
- Pull-to-refresh functionality
- Floating action button for adding new expense

## API Dependencies

- `GET /expenses/:email` - Load expenses
- `DELETE /expenses/:id` - Delete expense

## State

- `expenses`: Array of expense objects
- `loading`: Boolean for refresh state
```

### Postmortem Docs (`docs/postmortem/MM-DD-YY_FEATURE_ISSUE.md`)

```markdown
# [MM-DD-YY] - [Feature] - [Issue Summary]

## Problem

What went wrong and how it manifested.

## Root Cause

Why it happened (after investigation).

## Solution

What was done to fix it.

## Failed Attempts (if any)

- Attempt 1: Why it didn't work

## Prevention

How to avoid this in the future.

## Related Files

- `app/(tabs)/home.tsx`
- `lib/api/endpoints/expenses.ts`
```

---

## Environment Variables

Expo uses `app.json` / `app.config.js` for environment variables:

```javascript
// app.config.js
export default {
  expo: {
    name: 'MyApp',
    slug: 'my-app',
    extra: {
      apiUrl: process.env.API_URL || 'http://localhost:3000',
      environment: process.env.NODE_ENV || 'development',
    },
  },
};
```

Create `.env` files for different environments:

```bash
# .env.development
API_URL=http://localhost:3000

# .env.production
API_URL=https://api.myapp.com
```

Access in code:

```typescript
import Constants from 'expo-constants';

const apiUrl = Constants.expoConfig?.extra?.apiUrl;
```

---

## Storage Guidelines

| Data Type | Storage | Example |
|-----------|---------|---------|
| Auth tokens | SecureStore | JWT tokens, API keys |
| User preferences | AsyncStorage | Theme, language |
| Cached data | AsyncStorage | API response cache |
| Sensitive data | SecureStore | Passwords, PINs |

```typescript
// Secure storage for sensitive data
import * as SecureStore from 'expo-secure-store';

await SecureStore.setItemAsync('authToken', token);
const token = await SecureStore.getItemAsync('authToken');

// AsyncStorage for non-sensitive data
import AsyncStorage from '@react-native-async-storage/async-storage';

await AsyncStorage.setItem('theme', 'dark');
const theme = await AsyncStorage.getItem('theme');
```

---

## AI Agent Instructions

### On Every Session Start

1. Read this file (`CLAUDE.md`)
2. Check `docs/postmortem/` for recent issues
3. Review existing components before creating new ones
4. Check `app.json` for Expo configuration

### When Creating Components

1. Create folder structure with all required files
2. Check if similar component exists
3. Create/update documentation in `docs/components/`
4. Use consistent styling patterns

### When Creating Screens

1. Place in appropriate route group (`(auth)`, `(tabs)`, etc.)
2. Use default export (required by Expo Router)
3. Handle loading and error states
4. Create/update documentation in `docs/screens/`

### When Fixing Bugs

1. Check postmortem folder for similar past issues
2. After fixing, create postmortem if:
   - Fix required multiple attempts
   - Issue was unexpected or confusing
   - Platform-specific issue (iOS vs Android)

### Documentation Updates

- **Component created/updated/deleted** → Update `docs/components/`
- **Screen created/updated/deleted** → Update `docs/screens/`
- **Bug fixed after struggle** → Create postmortem

---

## Default Dependencies

```json
{
  "dependencies": {
    "expo": "~50.0.0",
    "expo-router": "~3.4.0",
    "expo-status-bar": "~1.11.0",
    "expo-secure-store": "~12.8.0",
    "expo-constants": "~15.4.0",
    "@react-native-async-storage/async-storage": "^1.21.0",
    "@expo/vector-icons": "^14.0.0",
    "react": "18.2.0",
    "react-native": "0.73.0",
    "axios": "^1.6.0"
  },
  "devDependencies": {
    "@types/react": "~18.2.0",
    "typescript": "^5.3.0"
  }
}
```

---

## EAS Build Configuration

```json
// eas.json
{
  "cli": {
    "version": ">= 7.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "env": {
        "API_URL": "https://staging-api.myapp.com"
      }
    },
    "production": {
      "env": {
        "API_URL": "https://api.myapp.com"
      }
    }
  }
}
```

---

## Project State

<!-- AI: Update this section as the project evolves -->

### Current Status

- [ ] Project initialized
- [ ] Base structure created
- [ ] Navigation configured
- [ ] Auth flow implemented
- [ ] Core screens built
- [ ] Documentation complete

### Implemented Screens

_List screens here as they are created_

### Recent Changes

_None yet_

### Known Issues

_None yet_
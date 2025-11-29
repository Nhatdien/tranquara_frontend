# 🚀 User Registration & Authentication - Implementation Plan

> Comprehensive step-by-step guide for implementing email/password + social login with Keycloak

> **🐳 Docker-First Development:** All backend services run in Docker. See [DOCKER-SETUP.md](../../../../DOCKER-SETUP.md) for complete setup guide.

---

## ⚡ Quick Start

**Prerequisites:**
```bash
# 1. Create Docker network (first time only)
docker network create tranquara-network

# 2. Start backend services
cd tranquara_core_service
make docker-up  # Starts DB, Keycloak, Core API, runs migrations

# 3. Verify migrations ran
make migrate-status  # Should show: 1
```

**Then follow the implementation phases below.**

---

## 🚨 Database Schema Conflict Detected!

### ⚠️ CRITICAL Issue Found:

**The Conflict:**
- **Migration file** (`000002_create_user_preference_table.up.sql`): Uses `user_information` (singular)
- **Feature docs** (all features): Use `user_informations` (plural)
- **Schema overview** (`00-DATABASE/SCHEMA_OVERVIEW.md`): Uses `user_informations` (plural)

### Additional Issues:
1. **Missing columns** in migration compared to docs:
   - `email` (referenced in User Register docs)
   - `username` (referenced in User Register docs)
   - `oauth_provider` (for social login tracking)
   
2. **Migration numbering**: Should be `000001` for the first core table (users), not `000002`

---

## ✅ Comprehensive Implementation Plan

### **PHASE 1: Database Schema Fix** 🔴 CRITICAL

**Task 1.1: Create proper user table migration**
```bash
# Create new migration (will be 000001 or renumber existing)
cd tranquara_core_service
# migrations/000001_create_user_informations_table.up.sql
```

**SQL Schema (Corrected)**:
```sql
CREATE TABLE user_informations (
    user_id UUID PRIMARY KEY,  -- From Keycloak sub claim
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(100),  -- Display name (changeable)
    oauth_provider VARCHAR(50),  -- 'email', 'google', 'apple'
    kyc_answers JSONB,
    name TEXT,
    age_range VARCHAR(50),
    gender VARCHAR(50),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_informations_email ON user_informations(email);
CREATE INDEX idx_user_informations_oauth_provider ON user_informations(oauth_provider);
```

**Down Migration**:
```sql
DROP TABLE IF EXISTS user_informations;
```

---

### **PHASE 2: Install Dependencies**

**Task 2.1: Install Capacitor plugins**

> ⚠️ **Important:** Use `capacitor-secure-storage-plugin` (NOT `@capacitor-community/secure-storage` which doesn't exist)

```bash
cd tranquara_frontend
yarn add @capacitor/preferences capacitor-secure-storage-plugin @capacitor-community/sqlite
npx cap sync
```

**Task 2.2: Verify environment config**
Your `.env` is already configured ✅
```properties
NUXT_PUBLIC_BASE_URL=http://localhost:4000/v1
NUXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8000/ws
NUXT_PUBLIC_KEYCLOAK_URL=http://localhost:4200
NUXT_PUBLIC_KEYCLOAK_REALM=tranquara_auth
NUXT_PUBLIC_KEYCLOAK_CLIENT_ID=tranquara_auth_client
```

---

### **PHASE 3: Keycloak Configuration**

**Task 3.1: Start Keycloak** (if not running)
```bash
cd tranquara_core_service
docker-compose up -d keycloak
```

**Task 3.2: Access Keycloak Admin**
- URL: `http://localhost:4200`
- Login with admin credentials from `keycloak.env`

**Task 3.3: Create Realm `tranquara_auth`**
1. Click "Add realm" → Name: `tranquara_auth`
2. Save

**Task 3.4: Create Client `tranquara_auth_client`**
1. Clients → Create
2. Client ID: `tranquara_auth_client`
3. Client Protocol: `openid-connect`
4. Access Type: `public` (for mobile/SPA)
5. Standard Flow: `Enabled`
6. Direct Access Grants: `Enabled`
7. Valid Redirect URIs:
   - `http://localhost:3000/*`
   - `capacitor://localhost/*` (for mobile)
   - `http://localhost:3000/auth/callback`
8. Web Origins: `*` (for development)
9. Save

**Task 3.5: Configure Apple Identity Provider**
1. Identity Providers → Add provider → Apple
2. Get Apple credentials (Client ID, Team ID, Key ID, Private Key)
3. Configure redirect URI: `http://localhost:4200/realms/tranquara_auth/broker/apple/endpoint`

**Task 3.6: Configure Google Identity Provider**
1. Identity Providers → Add provider → Google
2. Get Google OAuth credentials from Google Cloud Console
3. Configure redirect URI: `http://localhost:4200/realms/tranquara_auth/broker/google/endpoint`

**Task 3.7: Configure Token Settings**
1. Realm Settings → Tokens
2. Access Token Lifespan: `15 minutes`
3. Refresh Token Lifespan: `30 days`
4. SSO Session Idle: `30 days`

---

### **PHASE 4: Frontend - Storage Utilities**

**Task 4.1: Create `tranquara_frontend/utils/storage.ts`** (Capacitor Preferences wrapper)
```typescript
import { Preferences } from '@capacitor/preferences';

export const storage = {
  async set(key: string, value: any): Promise<void> {
    await Preferences.set({
      key,
      value: JSON.stringify(value),
    });
  },

  async get<T>(key: string): Promise<T | null> {
    const { value } = await Preferences.get({ key });
    return value ? JSON.parse(value) : null;
  },

  async remove(key: string): Promise<void> {
    await Preferences.remove({ key });
  },

  async clear(): Promise<void> {
    await Preferences.clear();
  },
};
```

**Task 4.2: Create `tranquara_frontend/utils/secure-storage.ts`** (Token storage)

> **Package:** `capacitor-secure-storage-plugin` for Capacitor 7 compatibility

```typescript
import { SecureStoragePlugin } from 'capacitor-secure-storage-plugin';

export const secureStorage = {
  async setToken(key: string, value: string): Promise<void> {
    await SecureStoragePlugin.set({ key, value });
  },

  async getToken(key: string): Promise<string | null> {
    try {
      const { value } = await SecureStoragePlugin.get({ key });
      return value;
    } catch {
      return null;
    }
  },

  async removeToken(key: string): Promise<void> {
    await SecureStoragePlugin.remove({ key });
  },

  async clearAll(): Promise<void> {
    await SecureStoragePlugin.clear();
  },
};
```

---

### **PHASE 5: Enhanced KeycloakService**

**Task 5.1: Update `stores/auth/keycloak_service.ts`**

Add these methods to existing class:

```typescript
import { secureStorage } from '~/utils/secure-storage';
import { storage } from '~/utils/storage';

// Add to KeycloakService class:

// Token management
public async storeTokens(): Promise<void> {
  const token = this.getToken();
  const refreshToken = KeycloakService._kc.refreshToken;
  
  if (token) {
    await secureStorage.setToken('access_token', token);
  }
  if (refreshToken) {
    await secureStorage.setToken('refresh_token', refreshToken);
  }
}

public async loadStoredTokens(): Promise<boolean> {
  const token = await secureStorage.getToken('access_token');
  const refreshToken = await secureStorage.getToken('refresh_token');
  
  if (token && refreshToken) {
    KeycloakService._kc.token = token;
    KeycloakService._kc.refreshToken = refreshToken;
    return true;
  }
  return false;
}

public async getUserInfo(): Promise<any> {
  return KeycloakService._kc.loadUserInfo();
}

public async doLogoutWithCleanup(): Promise<void> {
  await secureStorage.clearAll();
  await storage.clear();
  KeycloakService._kc.logout();
}

// Auto-refresh token every 30 seconds
public startTokenRefresh(): void {
  setInterval(async () => {
    try {
      await this.refreshToken();
      await this.storeTokens();
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
  }, 30000); // 30 seconds
}

// Social login support
public async initWithProvider(provider: 'google' | 'apple'): Promise<void> {
  const loginOptions: Keycloak.KeycloakLoginOptions = {
    idpHint: provider,
  };
  await KeycloakService._kc.login(loginOptions);
}
```

---

### **PHASE 6: Pinia Auth Store**

**Task 6.1: Create `stores/auth/index.ts`**

```typescript
import { defineStore } from 'pinia';
import { KeycloakService } from './keycloak_service';
import { TranquaraSDK } from '../tranquara_sdk';
import { storage } from '~/utils/storage';

interface User {
  id: string;
  email: string;
  username: string;
  name?: string;
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    isAuthenticated: false,
    loading: false,
    error: null as string | null,
  }),

  actions: {
    async initialize() {
      this.loading = true;
      try {
        const keycloak = KeycloakService.getInstance();
        
        // Try to load stored tokens
        const hasTokens = await keycloak.loadStoredTokens();
        
        if (hasTokens) {
          // Validate token
          const userInfo = await keycloak.getUserInfo();
          this.user = {
            id: keycloak.getUserUUid() || '',
            email: userInfo.email,
            username: userInfo.preferred_username,
            name: userInfo.name,
          };
          this.isAuthenticated = true;
          
          // Start auto-refresh
          keycloak.startTokenRefresh();
          
          // Sync with backend
          await this.syncUserProfile();
        }
      } catch (error) {
        console.error('Auth initialization failed:', error);
        this.isAuthenticated = false;
      } finally {
        this.loading = false;
      }
    },

    async login() {
      const keycloak = KeycloakService.getInstance();
      await keycloak.initKeycloak(async () => {
        await keycloak.storeTokens();
        await this.initialize();
      });
    },

    async loginWithSocial(provider: 'google' | 'apple') {
      const keycloak = KeycloakService.getInstance();
      await keycloak.initWithProvider(provider);
      await keycloak.storeTokens();
      await this.initialize();
    },

    async logout() {
      const keycloak = KeycloakService.getInstance();
      await keycloak.doLogoutWithCleanup();
      this.user = null;
      this.isAuthenticated = false;
    },

    async syncUserProfile() {
      try {
        const sdk = TranquaraSDK.getInstance();
        const profile = await sdk.fetch('/users/sync', {
          method: 'POST',
          body: JSON.stringify({
            email: this.user?.email,
            username: this.user?.username,
          }),
        });
        
        // Cache profile
        await storage.set('user_profile', profile);
      } catch (error) {
        console.error('Profile sync failed:', error);
      }
    },

    async updateProfile(data: Partial<User>) {
      try {
        const sdk = TranquaraSDK.getInstance();
        await sdk.fetch('/users/profile', {
          method: 'PUT',
          body: JSON.stringify(data),
        });
        
        // Update local state
        if (this.user) {
          this.user = { ...this.user, ...data };
        }
      } catch (error) {
        console.error('Profile update failed:', error);
        throw error;
      }
    },
  },
});
```

---

### **PHASE 7: Auth UI Pages** (Mobile-First with Nuxt UI)

**Task 7.1: Create `pages/auth/login.vue`**

```vue
<template>
  <div class="min-h-screen flex flex-col items-center justify-center p-6 bg-gray-50">
    <div class="w-full max-w-md space-y-6">
      <!-- Logo -->
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-900">TheraPrep</h1>
        <p class="mt-2 text-gray-600">Your mental wellness companion</p>
      </div>

      <!-- Login Options -->
      <UCard>
        <template #header>
          <h2 class="text-xl font-semibold">Welcome Back</h2>
        </template>

        <div class="space-y-4">
          <!-- Email/Password Login -->
          <UButton
            block
            size="lg"
            color="primary"
            icon="i-heroicons-envelope"
            @click="handleEmailLogin"
            :loading="loading"
          >
            Continue with Email
          </UButton>

          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div class="w-full border-t border-gray-300"></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span class="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <!-- Social Login -->
          <UButton
            block
            size="lg"
            color="black"
            icon="i-simple-icons-apple"
            @click="handleSocialLogin('apple')"
            :loading="loading"
          >
            Continue with Apple
          </UButton>

          <UButton
            block
            size="lg"
            color="white"
            icon="i-simple-icons-google"
            @click="handleSocialLogin('google')"
            :loading="loading"
          >
            Continue with Google
          </UButton>
        </div>

        <template #footer>
          <div class="text-center text-sm">
            <span class="text-gray-600">Don't have an account? </span>
            <UButton
              variant="link"
              @click="navigateTo('/auth/register')"
            >
              Sign up
            </UButton>
          </div>
        </template>
      </UCard>

      <!-- Terms -->
      <p class="text-xs text-center text-gray-500">
        By continuing, you agree to our Terms of Service and Privacy Policy
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';

const authStore = useAuthStore();
const loading = ref(false);

const handleEmailLogin = async () => {
  loading.value = true;
  try {
    await authStore.login();
  } catch (error) {
    console.error('Login failed:', error);
  } finally {
    loading.value = false;
  }
};

const handleSocialLogin = async (provider: 'apple' | 'google') => {
  loading.value = true;
  try {
    await authStore.loginWithSocial(provider);
  } catch (error) {
    console.error('Social login failed:', error);
  } finally {
    loading.value = false;
  }
};
</script>
```

**Task 7.2: Create `pages/auth/callback.vue`** (OAuth redirect handler)

```vue
<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <UIcon name="i-heroicons-arrow-path" class="animate-spin text-4xl" />
      <p class="mt-4 text-gray-600">Completing authentication...</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { storage } from '~/utils/storage';

const authStore = useAuthStore();

onMounted(async () => {
  await authStore.initialize();
  
  if (authStore.isAuthenticated) {
    // Check if user has completed onboarding
    const hasCompletedOnboarding = await storage.get('onboarding_completed');
    
    if (hasCompletedOnboarding) {
      navigateTo('/');
    } else {
      navigateTo('/onboarding/welcome');
    }
  } else {
    navigateTo('/auth/login');
  }
});
</script>
```

---

### **PHASE 8: Onboarding Pages**

**Task 8.1: Create `pages/onboarding/welcome.vue`**

```vue
<template>
  <div class="min-h-screen flex flex-col p-6">
    <div class="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
      <h1 class="text-3xl font-bold mb-4">Welcome to TheraPrep!</h1>
      <p class="text-gray-600 mb-8">
        We'd like to learn a bit about you to personalize your experience.
        You can skip this and complete it later in settings.
      </p>

      <div class="space-y-4">
        <UButton
          block
          size="lg"
          color="primary"
          @click="navigateTo('/onboarding/profile')"
        >
          Get Started
        </UButton>

        <UButton
          block
          size="lg"
          variant="outline"
          @click="handleSkip"
        >
          Skip for Now
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { storage } from '~/utils/storage';

const handleSkip = async () => {
  await storage.set('onboarding_skipped', true);
  navigateTo('/');
};
</script>
```

**Task 8.2: Create `pages/onboarding/profile.vue`** (KYC questions)

```vue
<template>
  <div class="min-h-screen p-6">
    <div class="max-w-md mx-auto">
      <h2 class="text-2xl font-bold mb-6">Tell Us About Yourself</h2>

      <UForm :state="form" @submit="handleSubmit" class="space-y-6">
        <!-- Name -->
        <UFormGroup label="Name" name="name">
          <UInput v-model="form.name" placeholder="Your name" />
        </UFormGroup>

        <!-- Age Range -->
        <UFormGroup label="Age Range" name="age_range">
          <USelect
            v-model="form.age_range"
            :options="ageRanges"
            placeholder="Select age range"
          />
        </UFormGroup>

        <!-- Gender -->
        <UFormGroup label="Gender" name="gender">
          <USelect
            v-model="form.gender"
            :options="genderOptions"
            placeholder="Select gender"
          />
        </UFormGroup>

        <!-- Journey Type -->
        <UFormGroup label="What brings you here?" name="journey_type">
          <URadioGroup
            v-model="form.kyc_answers.journey_type"
            :options="journeyTypes"
          />
        </UFormGroup>

        <!-- Submit -->
        <div class="space-y-3">
          <UButton
            type="submit"
            block
            size="lg"
            :loading="loading"
          >
            Complete Setup
          </UButton>

          <UButton
            block
            variant="ghost"
            @click="handleSkip"
          >
            Skip for Now
          </UButton>
        </div>
      </UForm>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '~/stores/auth';
import { storage } from '~/utils/storage';

const authStore = useAuthStore();
const loading = ref(false);

const form = reactive({
  name: '',
  age_range: '',
  gender: '',
  kyc_answers: {
    journey_type: '',
    support_intensity: '',
    goals: [],
    onboarding_completed_at: '',
  },
});

const ageRanges = ['18-24', '25-34', '35-44', '45-54', '55+'];
const genderOptions = ['Male', 'Female', 'Other', 'Prefer not to say'];
const journeyTypes = [
  { value: 'understand_myself', label: 'Understand myself better' },
  { value: 'prepare_therapy', label: 'Prepare for therapy' },
  { value: 'build_habit', label: 'Build a journaling habit' },
];

const handleSubmit = async () => {
  loading.value = true;
  try {
    form.kyc_answers.onboarding_completed_at = new Date().toISOString();
    
    await authStore.updateProfile(form);
    await storage.set('onboarding_completed', true);
    navigateTo('/');
  } catch (error) {
    console.error('Profile update failed:', error);
  } finally {
    loading.value = false;
  }
};

const handleSkip = async () => {
  await storage.set('onboarding_skipped', true);
  navigateTo('/');
};
</script>
```

---

### **PHASE 9: Backend API Endpoints (Go)**

**Task 9.1: Create `tranquara_core_service/cmd/api/handlers_users.go`**

```go
package main

import (
	"encoding/json"
	"net/http"
	"time"
)

type UserSyncInput struct {
	Email    string `json:"email"`
	Username string `json:"username"`
}

type UserProfileInput struct {
	Name       *string                `json:"name"`
	AgeRange   *string                `json:"age_range"`
	Gender     *string                `json:"gender"`
	KycAnswers *map[string]interface{} `json:"kyc_answers"`
	Settings   *map[string]interface{} `json:"settings"`
}

func (app *application) syncUserHandler(w http.ResponseWriter, r *http.Request) {
	var input UserSyncInput
	
	err := json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	// Get user_id from JWT token
	userUUID, err := app.GetUserUUIDFromContext(r.Context())
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	// TODO: Implement user sync logic
	// 1. Check if user exists in user_informations table
	// 2. If not, INSERT new record with user_id, email, username
	// 3. If yes, UPDATE last_login or updated_at timestamp
	// 4. Return full user profile

	response := map[string]interface{}{
		"user_id":  userUUID.String(),
		"email":    input.Email,
		"username": input.Username,
		"created_at": time.Now(),
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"user": response}, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

func (app *application) getUserProfileHandler(w http.ResponseWriter, r *http.Request) {
	userUUID, err := app.GetUserUUIDFromContext(r.Context())
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	// TODO: Fetch user from user_informations table
	// SELECT * FROM user_informations WHERE user_id = $1

	response := map[string]interface{}{
		"user_id": userUUID.String(),
		// Add other fields from database
	}

	err = app.writeJSON(w, http.StatusOK, envelope{"user": response}, nil)
	if err != nil {
		app.serverErrorResponse(w, r, err)
	}
}

func (app *application) updateUserProfileHandler(w http.ResponseWriter, r *http.Request) {
	userUUID, err := app.GetUserUUIDFromContext(r.Context())
	if err != nil {
		app.serverErrorResponse(w, r, err)
		return
	}

	var input UserProfileInput

	err = json.NewDecoder(r.Body).Decode(&input)
	if err != nil {
		app.badRequestResponse(w, r, err)
		return
	}

	// TODO: Update user in database
	// UPDATE user_informations 
	// SET name = $1, age_range = $2, gender = $3, kyc_answers = $4, updated_at = NOW()
	// WHERE user_id = $5

	app.writeJSON(w, http.StatusOK, envelope{"message": "Profile updated successfully"}, nil)
}
```

**Task 9.2: Add routes in `tranquara_core_service/cmd/api/routes.go`**

If this file doesn't exist, create it. Otherwise, add these routes:

```go
package main

import (
	"net/http"
	"github.com/julienschmidt/httprouter"
)

func (app *application) routes() http.Handler {
	router := httprouter.New()

	// User routes (protected with JWT)
	router.HandlerFunc(http.MethodPost, "/v1/users/sync", app.authMiddleWare(app.syncUserHandler))
	router.HandlerFunc(http.MethodGet, "/v1/users/profile", app.authMiddleWare(app.getUserProfileHandler))
	router.HandlerFunc(http.MethodPut, "/v1/users/profile", app.authMiddleWare(app.updateUserProfileHandler))

	// Existing routes...
	// Add your other routes here

	return app.recoverPanic(app.rateLimit(router))
}
```

**Task 9.3: Update `tranquara_core_service/cmd/api/main.go`** (if needed)

Ensure the routes are registered:

```go
// In main.go, ensure you're using the routes() method:
srv := &http.Server{
	Addr:         fmt.Sprintf(":%d", cfg.port),
	Handler:      app.routes(), // Make sure this line exists
	IdleTimeout:  time.Minute,
	ReadTimeout:  10 * time.Second,
	WriteTimeout: 30 * time.Second,
}
```

---

### **PHASE 10: Nuxt Auth Plugin**

**Task 10.1: Create `plugins/auth.client.ts`**

```typescript
export default defineNuxtPlugin(async (nuxtApp) => {
  const authStore = useAuthStore();
  const router = useRouter();

  // Initialize auth on app start
  await authStore.initialize();

  // Route guards
  router.beforeEach((to, from, next) => {
    const publicPages = ['/auth/login', '/auth/register', '/auth/callback'];
    const authRequired = !publicPages.includes(to.path);

    if (authRequired && !authStore.isAuthenticated) {
      return next('/auth/login');
    }

    next();
  });
});
```

**Task 10.2: Update `plugins/tranquaraSDK.client.ts`** (if exists)

Ensure SDK uses Keycloak token:

```typescript
import { KeycloakService } from '~/stores/auth/keycloak_service';

export default defineNuxtPlugin(() => {
  const tranquaraSDK = TranquaraSDK.getInstance();
  const keycloakService = KeycloakService.getInstance();

  // Initialize Keycloak first, then SDK
  keycloakService.initKeycloak(async () => {
    tranquaraSDK.config.access_token = keycloakService.getToken();
    tranquaraSDK.config.current_username = keycloakService.getTokenParsed()?.preferred_username;
  });

  return {
    provide: {
      tranquaraSDK,
    },
  };
});
```

---

### **PHASE 11: Testing Checklist**

#### ✅ **Email/Password Registration**
- [ ] User can register with email/password via Keycloak
- [ ] Tokens stored in SecureStorage
- [ ] User profile synced to backend (`POST /v1/users/sync`)
- [ ] Redirect to onboarding after first login
- [ ] Access token appears in API request headers

#### ✅ **Social Login (Apple)**
- [ ] Apple Sign-In button triggers Keycloak flow
- [ ] Shows native Apple authentication prompt
- [ ] New user created automatically in database
- [ ] Tokens stored successfully
- [ ] User redirected to onboarding

#### ✅ **Social Login (Google)**
- [ ] Google Sign-In button works
- [ ] Shows Google account picker
- [ ] Existing email links to account
- [ ] Tokens stored successfully
- [ ] User redirected appropriately

#### ✅ **Token Management**
- [ ] Access token auto-refreshes every 30 seconds
- [ ] Refresh token persists across app restarts
- [ ] Expired tokens trigger re-authentication
- [ ] Token stored in SecureStorage (not localStorage)
- [ ] API calls include `Authorization: Bearer {token}` header

#### ✅ **Logout**
- [ ] All tokens cleared from SecureStorage
- [ ] All local data cleared from Capacitor Preferences
- [ ] User redirected to login page
- [ ] Cannot access protected routes after logout
- [ ] Re-login required for API access

#### ✅ **Onboarding**
- [ ] Can skip onboarding and go straight to app
- [ ] Can complete KYC questions
- [ ] Profile saved to backend (`PUT /v1/users/profile`)
- [ ] `onboarding_completed` flag stored locally
- [ ] Can access onboarding from settings later (future)

#### ✅ **Offline Behavior**
- [ ] App works offline after first login
- [ ] Tokens persist across app restarts
- [ ] No crash when API calls fail offline
- [ ] Sync queue stores changes for later (future)

#### ✅ **Mobile-Specific**
- [ ] UI renders correctly on iOS
- [ ] UI renders correctly on Android
- [ ] SecureStorage uses Keychain (iOS) / Keystore (Android)
- [ ] Capacitor redirect URIs work (`capacitor://localhost`)
- [ ] No CORS issues on mobile

---

## 🎯 Implementation Order

### **Recommended Sequence:**

1. **✅ Fix Database Schema** (CRITICAL - do this first!)
   - Create `000001_create_user_informations_table.up.sql`
   - Run migration: `make migrate-up` or equivalent

2. **✅ Install Dependencies**
   - Run `npm install` for Capacitor plugins
   - Run `npx cap sync`

3. **✅ Configure Keycloak**
   - Set up realm, client, identity providers
   - Test login flow in Keycloak admin UI

4. **✅ Build Storage Utilities**
   - `utils/storage.ts`
   - `utils/secure-storage.ts`

5. **✅ Enhance KeycloakService**
   - Add token storage methods
   - Add auto-refresh mechanism
   - Add social login support

6. **✅ Create Auth Store**
   - `stores/auth/index.ts`
   - Integrate with KeycloakService

7. **✅ Build UI Pages**
   - Login page
   - Callback page
   - Onboarding pages

8. **✅ Create Backend Endpoints**
   - User sync endpoint
   - Profile CRUD endpoints
   - Test with Postman/curl

9. **✅ Add Nuxt Plugin**
   - Auto-authentication on app start
   - Route guards

10. **✅ Test Everything**
    - Follow testing checklist above
    - Test on web browser
    - Test on iOS simulator/device
    - Test on Android emulator/device

---

## 🔧 Troubleshooting

### **Keycloak Issues**

**Problem:** "Invalid redirect URI"
- **Solution:** Add `capacitor://localhost/*` to Valid Redirect URIs in client settings

**Problem:** "CORS error" in browser
- **Solution:** Add `*` to Web Origins in client settings (development only)

**Problem:** Token refresh fails
- **Solution:** Check refresh token lifespan in Realm Settings → Tokens

### **Mobile Issues**

**Problem:** SecureStorage not working
- **Solution:** Run `npx cap sync` and rebuild app

**Problem:** Keycloak not opening in mobile
- **Solution:** Check redirect URI includes `capacitor://localhost`

**Problem:** Tokens not persisting
- **Solution:** Verify SecureStorage plugin is installed correctly

### **Backend Issues**

**Problem:** "Invalid token" error
- **Solution:** Verify `publicKey.pem` matches Keycloak realm public key

**Problem:** User sync fails
- **Solution:** Check JWT contains `sub` claim (user_id)

**Problem:** Database connection error
- **Solution:** Run migrations: `make migrate-up`

---

## 📚 Additional Resources

### **Keycloak Documentation**
- [Keycloak Admin Guide](https://www.keycloak.org/docs/latest/server_admin/)
- [Securing Applications](https://www.keycloak.org/docs/latest/securing_apps/)
- [Identity Providers](https://www.keycloak.org/docs/latest/server_admin/#_identity_broker)

### **Capacitor Documentation**
- [Preferences API](https://capacitorjs.com/docs/apis/preferences)
- [SecureStorage Plugin](https://github.com/capacitor-community/secure-storage)
- [SQLite Plugin](https://github.com/capacitor-community/sqlite)

### **Nuxt Documentation**
- [Pinia Store](https://pinia.vuejs.org/core-concepts/)
- [Nuxt Plugins](https://nuxt.com/docs/guide/directory-structure/plugins)
- [Route Middleware](https://nuxt.com/docs/guide/directory-structure/middleware)

---

## ✅ Definition of Done

This feature is considered **complete** when:

- [ ] Database migration runs successfully
- [ ] All Capacitor plugins installed and synced
- [ ] Keycloak realm and client configured
- [ ] User can register with email/password
- [ ] User can login with Apple/Google
- [ ] Tokens stored securely and persist across restarts
- [ ] Auto-refresh works (no manual re-login for 30 days)
- [ ] Logout clears all data
- [ ] Onboarding can be skipped or completed
- [ ] Backend endpoints return user profile
- [ ] Route guards protect authenticated pages
- [ ] All tests in checklist pass
- [ ] Works on iOS, Android, and Web

---

**Implementation Start Date:** _[To be filled]_  
**Implementation End Date:** _[To be filled]_  
**Implemented By:** _[To be filled]_

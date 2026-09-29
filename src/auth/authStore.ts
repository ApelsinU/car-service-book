import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { createId } from '../lib/id'
import { createSalt, hashPassword } from './crypto'

export type AuthError = 'invalid-credentials' | 'login-taken' | 'invalid-input'

export interface AuthUser {
  id: string
  login: string
  salt: string
  passwordHash: string
  createdAt: string
}

export const MIN_LOGIN_LENGTH = 3
export const MIN_PASSWORD_LENGTH = 8

export const AUTH_ERRORS: Record<AuthError, string> = {
  'invalid-credentials': 'Неверный логин или пароль',
  'login-taken': 'Такой логин уже занят',
  'invalid-input': `Логин от ${MIN_LOGIN_LENGTH} символов, пароль от ${MIN_PASSWORD_LENGTH} символов`,
}

export const DEMO_CREDENTIALS = { login: 'demo', password: 'demo12345' }

interface AuthState {
  users: AuthUser[]
  currentUserId: string | null
  error: AuthError | null
  pending: boolean
  hasHydrated: boolean

  login: (login: string, password: string) => Promise<boolean>
  register: (login: string, password: string) => Promise<boolean>
  logout: () => void
  clearError: () => void
  setHasHydrated: (value: boolean) => void
}

function normalize(login: string): string {
  return login.trim().toLowerCase()
}

function isValid(login: string, password: string): boolean {
  return login.length >= MIN_LOGIN_LENGTH && password.length >= MIN_PASSWORD_LENGTH
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      users: [],
      currentUserId: null,
      error: null,
      pending: false,
      hasHydrated: false,

      login: async (login, password) => {
        const key = normalize(login)
        set({ pending: true, error: null })

        if (!isValid(key, password)) {
          set({ pending: false, error: 'invalid-input' })
          return false
        }

        const user = get().users.find((candidate) => candidate.login === key)
        const passwordHash = user ? await hashPassword(password, user.salt) : null

        if (!user || user.passwordHash !== passwordHash) {
          set({ pending: false, error: 'invalid-credentials' })
          return false
        }

        set({ pending: false, error: null, currentUserId: user.id })
        return true
      },

      register: async (login, password) => {
        const key = normalize(login)
        set({ pending: true, error: null })

        if (!isValid(key, password)) {
          set({ pending: false, error: 'invalid-input' })
          return false
        }

        if (get().users.some((candidate) => candidate.login === key)) {
          set({ pending: false, error: 'login-taken' })
          return false
        }

        const salt = createSalt()
        const user: AuthUser = {
          id: createId(),
          login: key,
          salt,
          passwordHash: await hashPassword(password, salt),
          createdAt: new Date().toISOString(),
        }

        set((state) => ({
          users: [...state.users, user],
          currentUserId: user.id,
          pending: false,
          error: null,
        }))

        return true
      },

      logout: () => set({ currentUserId: null, error: null }),

      clearError: () => set({ error: null }),

      setHasHydrated: (hasHydrated) => set({ hasHydrated }),
    }),
    {
      name: 'car-service-book-auth',
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        users: state.users,
        currentUserId: state.currentUserId,
      }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true)
      },
    },
  ),
)

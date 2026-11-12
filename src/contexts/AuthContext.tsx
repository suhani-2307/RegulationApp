import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react'

export type Role = 'user' | 'caregiver' | null

export interface UserProfile {
  firstName: string
  lastName: string
  username: string
  age: number
  email: string
  diagnosis: string
  pairedCaregiverUsername?: string
}

export interface CaregiverProfile {
  name: string
  username: string
  email: string
  pairedUserEmails?: string[]
}

export type ZoneColor = 'green' | 'yellow' | 'red'

export interface ZoneEntry {
  zone: ZoneColor
  emotion: string | null
  time: Date
  location?: string
  // Groups the check-ins from one pass through the zones loop (e.g. yellow → green)
  sessionId: string
}

export function newSessionId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export interface ClientInfo {
  email: string
  firstName: string
  lastName: string
  username: string
  lastEntry: ZoneEntry | null
}

interface AuthState {
  role: Role
  user: UserProfile | null
  caregiver: CaregiverProfile | null
}

type Result = { ok: boolean; error?: string }

interface AuthContextValue extends AuthState {
  // True while restoring a saved session on page load
  loading: boolean
  registerUser: (profile: UserProfile, password: string) => Promise<Result>
  registerCaregiver: (profile: CaregiverProfile, password: string) => Promise<Result>
  login: (identifier: string, password: string) => Promise<Result & { role?: Role }>
  pairByUsername: (username: string) => Promise<Result>
  logZoneEntry: (entry: ZoneEntry) => void
  getClients: () => Promise<ClientInfo[]>
  getMyEntries: () => ZoneEntry[]
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

// ---------- API helpers ----------

const TOKEN_KEY = 'regulation-app-token'
const PROFILE_REFRESH_MS = 15000

function getToken(): string | null {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}
function setToken(token: string | null) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch { /* storage unavailable — session just won't survive a refresh */ }
}

class ApiError extends Error {
  constructor(message: string, public status: number) { super(message) }
}

async function api<T>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  const token = getToken()
  let res: Response
  try {
    res = await fetch(`/api${path}`, {
      method: options.method ?? 'GET',
      headers: {
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    })
  } catch {
    throw new ApiError('Could not reach the server. Check your connection.', 0)
  }
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new ApiError(data.error ?? 'Something went wrong.', res.status)
  return data as T
}

const errorMessage = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong.')

// The API sends times as ISO strings; the app works with Date objects
type ApiZoneEntry = Omit<ZoneEntry, 'time'> & { time: string }
const toEntry = (e: ApiZoneEntry): ZoneEntry => ({ ...e, time: new Date(e.time) })

type SessionResponse = AuthState & { token?: string }

// ---------- provider ----------

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({ role: null, user: null, caregiver: null })
  const [loading, setLoading] = useState(() => !!getToken())
  const [myEntries, setMyEntries] = useState<ZoneEntry[]>([])

  const applySession = useCallback((s: SessionResponse) => {
    if (s.token) setToken(s.token)
    setState({ role: s.role, user: s.user, caregiver: s.caregiver })
  }, [])

  const logout = useCallback(() => {
    setToken(null)
    setState({ role: null, user: null, caregiver: null })
    setMyEntries([])
  }, [])

  const refreshProfile = useCallback(async () => {
    try {
      applySession(await api<SessionResponse>('/me'))
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) logout()
    }
  }, [applySession, logout])

  // Restore a saved session on page load
  useEffect(() => {
    if (!getToken()) return
    refreshProfile().finally(() => setLoading(false))
  }, [refreshProfile])

  // Keep pairing info fresh, so a user sees when a caregiver links to them (and vice versa)
  useEffect(() => {
    if (!state.role) return
    const id = setInterval(refreshProfile, PROFILE_REFRESH_MS)
    return () => clearInterval(id)
  }, [state.role, refreshProfile])

  // Load the signed-in user's check-in history
  useEffect(() => {
    if (state.role !== 'user') return
    api<ApiZoneEntry[]>('/zone-entries/mine')
      .then(rows => setMyEntries(rows.map(toEntry)))
      .catch(() => {})
  }, [state.role, state.user?.email])

  async function registerUser(profile: UserProfile, password: string): Promise<Result> {
    try {
      applySession(await api<SessionResponse>('/signup', { method: 'POST', body: { role: 'user', ...profile, password } }))
      return { ok: true }
    } catch (e) {
      return { ok: false, error: errorMessage(e) }
    }
  }

  async function registerCaregiver(profile: CaregiverProfile, password: string): Promise<Result> {
    try {
      applySession(await api<SessionResponse>('/signup', { method: 'POST', body: { role: 'caregiver', ...profile, password } }))
      return { ok: true }
    } catch (e) {
      return { ok: false, error: errorMessage(e) }
    }
  }

  async function login(identifier: string, password: string) {
    try {
      const s = await api<SessionResponse>('/login', { method: 'POST', body: { identifier, password } })
      applySession(s)
      return { ok: true, role: s.role }
    } catch (e) {
      return { ok: false, error: errorMessage(e) }
    }
  }

  // Called by a caregiver to link to a user via their @username
  async function pairByUsername(username: string): Promise<Result> {
    try {
      applySession(await api<SessionResponse>('/pair', { method: 'POST', body: { username } }))
      return { ok: true }
    } catch (e) {
      return { ok: false, error: errorMessage(e) }
    }
  }

  // Shows the entry immediately, then saves it to the server in the background
  function logZoneEntry(entry: ZoneEntry) {
    if (state.role !== 'user') return
    setMyEntries(prev => [entry, ...prev])
    api('/zone-entries', { method: 'POST', body: { ...entry, time: entry.time.toISOString() } })
      .catch(err => console.error('Failed to save check-in:', err))
  }

  async function getClients(): Promise<ClientInfo[]> {
    if (state.role !== 'caregiver') return []
    const rows = await api<(Omit<ClientInfo, 'lastEntry'> & { lastEntry: ApiZoneEntry | null })[]>('/clients')
    return rows.map(c => ({ ...c, lastEntry: c.lastEntry ? toEntry(c.lastEntry) : null }))
  }

  // Newest first
  function getMyEntries(): ZoneEntry[] {
    return myEntries
  }

  return (
    <AuthContext.Provider value={{ ...state, loading, registerUser, registerCaregiver, login, pairByUsername, logZoneEntry, getClients, getMyEntries, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

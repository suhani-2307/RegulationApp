import { useNavigate } from 'react-router-dom'
import { useAuth, type ClientInfo, type ZoneColor } from '../contexts/AuthContext'
import ThemeToggle from '../components/ThemeToggle'

const ZONE_LABEL: Record<ZoneColor, string> = {
  green: 'Green Zone',
  yellow: 'Yellow Zone',
  red: 'Red Zone',
}

const ZONE_COLOR: Record<ZoneColor, string> = {
  green: 'var(--green)',
  yellow: 'var(--yellow)',
  red: 'var(--red)',
}

function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  return date.toLocaleDateString([], { month: 'short', day: 'numeric' })
}

export default function ClientsPage() {
  const navigate = useNavigate()
  const { getClients } = useAuth()
  const clients = getClients()

  return (
    <div style={{
      backgroundColor: 'var(--bg)',
      minHeight: '100vh',
      padding: '40px 24px 48px',
      display: 'flex',
      flexDirection: 'column',
      gap: 16,
    }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => navigate('/dashboard')}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            backgroundColor: 'var(--surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--border)', cursor: 'pointer',
          }}
          title="Back to dashboard"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <ThemeToggle />
      </div>

      {/* Header */}
      <div style={{ marginTop: 4 }}>
        <h1 style={{ color: 'var(--text)', fontSize: 22, fontWeight: 700, marginBottom: 6 }}>My Clients</h1>
        <p style={{ color: 'var(--muted)', fontSize: 14 }}>
          {clients.length === 0
            ? 'No clients paired yet.'
            : `${clients.length} client${clients.length === 1 ? '' : 's'} connected`}
        </p>
      </div>

      {/* Empty state */}
      {clients.length === 0 && (
        <div style={{
          flex: 1, display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          gap: 12, paddingTop: 48,
        }}>
          <div style={{
            width: 64, height: 64, borderRadius: 20,
            backgroundColor: 'var(--surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="28" height="28" fill="none" viewBox="0 0 24 24">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="9" cy="7" r="4" stroke="var(--muted)" strokeWidth="1.5" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <p style={{ color: 'var(--muted)', fontSize: 14, textAlign: 'center', maxWidth: 220 }}>
            Pair with clients from your dashboard to see them here.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              padding: '10px 20px', borderRadius: 10, fontSize: 13, fontWeight: 600,
              backgroundColor: 'var(--green)', color: '#fff', cursor: 'pointer',
              marginTop: 4,
            }}
          >
            Go to dashboard
          </button>
        </div>
      )}

      {/* Client cards */}
      {clients.map(client => (
        <ClientCard key={client.email} client={client} />
      ))}
    </div>
  )
}

function ClientCard({ client }: { client: ClientInfo }) {
  const { lastEntry } = client
  const fullName = `${client.firstName} ${client.lastName}`.trim() || client.email

  return (
    <div style={{
      borderRadius: 16,
      backgroundColor: 'var(--surface)',
      border: '1px solid var(--border)',
      padding: 20,
      display: 'flex',
      flexDirection: 'column',
      gap: 14,
    }}>
      {/* Name row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
          backgroundColor: 'color-mix(in srgb, var(--blue) 15%, transparent)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <span style={{ color: 'var(--blue)', fontSize: 15, fontWeight: 700 }}>
            {client.firstName ? client.firstName[0].toUpperCase() : '?'}
          </span>
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ color: 'var(--text)', fontSize: 15, fontWeight: 600 }}>{fullName}</p>
          <p style={{ color: 'var(--muted)', fontSize: 12 }}>{client.email}</p>
        </div>
      </div>

      {/* Divider */}
      <div style={{ height: 1, backgroundColor: 'var(--border)' }} />

      {/* Check-in info */}
      {lastEntry ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>
              Last check-in
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <div style={{
                width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                backgroundColor: ZONE_COLOR[lastEntry.zone],
              }} />
              <span style={{ color: 'var(--text)', fontSize: 14, fontWeight: 500 }}>
                {ZONE_LABEL[lastEntry.zone]}
                {lastEntry.emotion && (
                  <span style={{ color: 'var(--muted)', fontWeight: 400 }}> · {lastEntry.emotion}</span>
                )}
              </span>
            </div>
          </div>
          <div style={{ textAlign: 'right', flexShrink: 0 }}>
            <p style={{ color: 'var(--muted)', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 5 }}>
              When
            </p>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>{formatTimeAgo(lastEntry.time)}</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: 'var(--border)', flexShrink: 0 }} />
          <p style={{ color: 'var(--muted)', fontSize: 13 }}>No check-ins yet</p>
        </div>
      )}
    </div>
  )
}

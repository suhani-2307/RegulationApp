import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import ThemeToggle from '../components/ThemeToggle'

// "Walking Around Safely" social story. Photos live in public/social-story/;
// if a photo is missing, the fallback icon is shown instead.
const PAGES = [
  { text: 'Sometimes, I like to walk around while I am at IMPACT.', icon: '🚶' },
  { text: 'If I walk too far away from my group and staff, this becomes unsafe.', icon: '⚠️' },
  { text: 'When my group is in the office, I can walk around the office, but I cannot cross the blue tape.', icon: '🚪', image: '/social-story/office-door.jpg' },
  { text: 'When my group is in a classroom, I may walk around the room or the hallway by the door to the classroom.', icon: '🏫', image: '/social-story/classroom-hallway.jpg' },
  { text: 'If I am out on campus or in the community, it is very important I stay with my group.', icon: '👥' },
  { text: 'If I stay by my group, I can move my body safely.', icon: '👍' },
]

export default function SocialStoryPage() {
  const navigate = useNavigate()
  const routeLocation = useLocation()
  const routeState = (routeLocation.state as { zone?: 'red' | 'yellow'; selected?: string[] } | null) ?? {}
  const zone = routeState.zone ?? 'yellow'
  const accent = `var(--${zone})`
  const [page, setPage] = useState(0)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  const current = PAGES[page]
  const isLast = page === PAGES.length - 1
  const showImage = current.image && !failedImages.has(current.image)

  function backToRoutine(finished: boolean) {
    const selected = new Set(routeState.selected ?? [])
    if (finished) selected.add('story')
    navigate(zone === 'red' ? '/calming-routine' : '/yellow-routine', { state: { ...routeState, selected: [...selected] } })
  }

  return (
    <div style={{
      backgroundColor: 'var(--bg)',
      minHeight: '100vh',
      padding: '40px 24px 48px',
      display: 'flex',
      flexDirection: 'column',
      gap: 20,
    }}>
      {/* Top bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          onClick={() => backToRoutine(false)}
          style={{
            width: 36, height: 36, borderRadius: '50%',
            backgroundColor: 'var(--surface)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid var(--border)', cursor: 'pointer', flexShrink: 0,
          }}
          title="Back to routine"
        >
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24">
            <path d="M15 18l-6-6 6-6" stroke="var(--muted)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
        <p style={{ color: 'var(--text)', fontSize: 17, fontWeight: 700 }}>Social Story</p>
        <ThemeToggle />
      </div>

      {/* Header */}
      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <h1 style={{ color: 'var(--text)', fontSize: 22, fontWeight: 700 }}>Walking Around Safely</h1>
      </div>

      {/* Story page */}
      <div style={{
        flex: 1,
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24,
        padding: '32px 20px', borderRadius: 18,
        border: `2px solid ${accent}`,
        backgroundColor: `color-mix(in srgb, ${accent} 8%, transparent)`,
      }}>
        {showImage ? (
          <img
            src={current.image}
            alt=""
            onError={() => setFailedImages(prev => new Set(prev).add(current.image!))}
            style={{ width: '100%', maxHeight: 280, objectFit: 'cover', borderRadius: 12 }}
          />
        ) : (
          <div style={{
            width: 120, height: 120, borderRadius: '50%',
            backgroundColor: `color-mix(in srgb, ${accent} 16%, transparent)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 60,
          }}>
            {current.icon}
          </div>
        )}
        <p style={{ color: 'var(--text)', fontSize: 20, fontWeight: 600, lineHeight: 1.4, textAlign: 'center' }}>
          {current.text}
        </p>
      </div>

      {/* Progress dots */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
        {PAGES.map((_, i) => (
          <div key={i} style={{
            width: 8, height: 8, borderRadius: '50%',
            backgroundColor: i === page ? accent : 'var(--border)',
          }} />
        ))}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', gap: 12 }}>
        <button
          onClick={() => setPage(p => p - 1)}
          disabled={page === 0}
          style={{
            flex: 1, padding: '15px', borderRadius: 14,
            fontWeight: 600, fontSize: 15,
            backgroundColor: 'var(--surface)', color: 'var(--text)',
            border: '1px solid var(--border)',
            opacity: page === 0 ? 0.35 : 1,
            cursor: page === 0 ? 'default' : 'pointer',
          }}
        >
          Back
        </button>
        <button
          onClick={() => (isLast ? backToRoutine(true) : setPage(p => p + 1))}
          style={{
            flex: 2, padding: '15px', borderRadius: 14,
            fontWeight: 600, fontSize: 15,
            backgroundColor: accent, color: zone === 'red' ? '#fff' : '#1a1a00',
            border: 'none', cursor: 'pointer',
          }}
        >
          {isLast ? 'I finished my story ✓' : 'Next'}
        </button>
      </div>
    </div>
  )
}

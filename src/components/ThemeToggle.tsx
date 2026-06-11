import { useTheme } from '../contexts/ThemeContext'

export default function ThemeToggle() {
  const { theme, toggle } = useTheme()
  const isDark = theme === 'dark'

  return (
    <button
      onClick={toggle}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '6px 12px',
        borderRadius: 20,
        backgroundColor: 'var(--surface)',
        border: '1px solid var(--border)',
        color: 'var(--muted)',
        fontSize: 12,
        fontWeight: 500,
        cursor: 'pointer',
        transition: 'background-color 0.2s, border-color 0.2s',
        flexShrink: 0,
      }}
    >
      {isDark ? (
        <>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5" />
            <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          Light
        </>
      ) : (
        <>
          <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
            <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Dark
        </>
      )}
    </button>
  )
}

'use client' // Error boundaries must be Client Components.

// Replaces the root layout when it fails, so it cannot rely on globals.css or next/font.
// Inline styles reproduce the key tokens (surface, primary) with system fonts.
export default function GlobalError({
  error,
  retry,
}: {
  error: Error & { digest?: string }
  retry: () => void
}) {
  return (
    <html lang="en">
      <body
        style={{
          margin: 0,
          minHeight: '100dvh',
          display: 'grid',
          placeItems: 'center',
          background: '#fcf9f8',
          color: '#1c1b1b',
          fontFamily: 'system-ui, sans-serif',
        }}
      >
        <title>Something went wrong | ZORKO Sangli</title>
        <main style={{ textAlign: 'center', padding: 24 }}>
          <h1 style={{ fontSize: 24 }}>Something went wrong</h1>
          <p style={{ color: '#5a4139' }}>Please try again in a moment.</p>
          {error.digest && (
            <p style={{ color: '#5a4139', fontSize: 12 }}>Reference: {error.digest}</p>
          )}
          <button
            type="button"
            onClick={() => retry()}
            style={{
              background: '#a93200',
              color: '#fff',
              border: 0,
              borderRadius: 9999,
              padding: '14px 28px',
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Try again
          </button>
        </main>
      </body>
    </html>
  )
}

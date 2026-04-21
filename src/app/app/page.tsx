/**
 * HEARST OS Main App
 * 
 * TODO: This is a placeholder. Implement actual HEARST OS runtime here.
 * This route will contain the full app experience with:
 * - Chat interface
 * - Right panel / surfaces
 * - Thread management
 * - Agent interactions
 */
export default function AppPage() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'var(--dashboard-page)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'var(--dashboard-text-primary)',
      }}
    >
      <div style={{ textAlign: 'center', maxWidth: '600px', padding: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem' }}>
          HEARST OS
        </h1>
        <p style={{ color: 'var(--dashboard-text-secondary)', marginBottom: '2rem' }}>
          Main app placeholder. Implement HEARST OS runtime here.
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            padding: '0.75rem 1.5rem',
            background: 'var(--dashboard-accent)',
            color: 'var(--dashboard-page)',
            borderRadius: 'var(--dashboard-radius-button)',
            textDecoration: 'none',
            fontWeight: 600,
          }}
        >
          Back to Landing
        </a>
      </div>
    </div>
  );
}

import { Component, ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
  fallback?: ReactNode
}

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: unknown) {
    // Log to console and store last UI error for debugging
    console.error('UI ErrorBoundary caught:', error, errorInfo)
    try {
      const payload = {
        message: error.message,
        stack: error.stack,
        time: new Date().toISOString()
      }
      localStorage.setItem('last_ui_error', JSON.stringify(payload))
    } catch {}
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div style={{ padding: 24 }}>
            <h2 style={{ marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ marginBottom: 16 }}>Try refreshing the page or returning to the dashboard.</p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => this.setState({ hasError: false, error: undefined })}
                style={{
                  padding: '8px 12px',
                  borderRadius: 6,
                  border: '1px solid var(--primary-600)',
                  background: 'var(--primary-600)',
                  color: '#fff'
                }}
              >
                Retry
              </button>
              <a href="/dashboard" style={{
                padding: '8px 12px',
                borderRadius: 6,
                border: '1px solid var(--gray-300)',
                background: 'var(--gray-100)',
                color: 'inherit',
                textDecoration: 'none'
              }}>
                Go to Dashboard
              </a>
            </div>
          </div>
        )
      )
    }
    return this.props.children
  }
}

export default ErrorBoundary
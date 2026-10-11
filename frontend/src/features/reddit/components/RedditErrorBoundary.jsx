import React from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export class RedditErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    // Log isolated feature failure without crashing app
    console.warn('[RedditErrorBoundary] Caught isolated feature error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="border border-[var(--line)] bg-[var(--paper-2)] p-6 text-center space-y-3 rounded shadow-[var(--shadow-hard)]">
          <div className="flex items-center justify-center gap-2 text-[var(--clay)]">
            <AlertCircle className="h-5 w-5" />
            <span className="font-serif text-base font-bold text-[var(--ink)]">
              Reddit Field Dispatches Temporarily Unavailable
            </span>
          </div>
          <p className="text-xs text-[var(--ink-2)] max-w-md mx-auto leading-relaxed">
            The external community dispatches could not be loaded at this time. The rest of the Hailey living atlas remains fully operational.
          </p>
          <button
            type="button"
            onClick={this.handleReset}
            className="inline-flex items-center gap-1.5 border border-[var(--ink)] bg-[var(--paper)] px-3 py-1.5 font-mono text-xs text-[var(--ink)] shadow-[2px_2px_0_var(--ink)] hover:bg-[var(--paper-2)] transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            <span>Retry Connection</span>
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

export default RedditErrorBoundary

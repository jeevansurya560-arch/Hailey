import React from 'react'
import { AlertCircle, X, RotateCcw } from 'lucide-react'

export class EditProfileErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('[EditProfileErrorBoundary] Caught profile editor error:', error, errorInfo)
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null })
    this.props.onClose?.()
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-md border border-[var(--ink)] bg-[var(--paper)] p-6 shadow-[var(--shadow-hard)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--line)] pb-3">
              <div className="flex items-center gap-2 text-amber-700">
                <AlertCircle className="h-5 w-5" />
                <h3 className="font-serif text-lg font-bold text-[var(--ink)]">Profile Editor Notice</h3>
              </div>
              <button
                type="button"
                onClick={this.handleReset}
                className="text-[var(--ink-2)] hover:text-[var(--ink)] p-1"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <p className="text-xs font-mono text-[var(--ink-2)] leading-relaxed">
              An unexpected display error occurred while rendering the profile editor. Your persisted profile data remains safe.
            </p>

            {this.state.error?.message && (
              <div className="p-2.5 bg-red-50 border border-red-200 text-red-700 text-[11px] font-mono break-words">
                {this.state.error.message}
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--line)]">
              <button
                type="button"
                onClick={this.handleReset}
                className="border border-[var(--ink)] bg-[var(--clay)] px-4 py-2 font-mono text-xs uppercase font-bold text-[var(--paper)] flex items-center gap-1.5 shadow-[1.5px_1.5px_0_var(--ink)] hover:opacity-90 transition-opacity"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>Dismiss & Return</span>
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default EditProfileErrorBoundary

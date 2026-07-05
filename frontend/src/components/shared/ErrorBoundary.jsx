import { Component } from 'react'
import { AlertCircle, RefreshCw } from 'lucide-react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null, recoveryAttempts: 0 }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    if (this.state.recoveryAttempts < 1) {
      console.warn('ErrorBoundary attempting auto-recovery...')
      this.setState(prevState => ({
        hasError: false,
        error: null,
        recoveryAttempts: prevState.recoveryAttempts + 1
      }))
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null, recoveryAttempts: 0 })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-6">
          <div className="max-w-md w-full bg-[#12121a] border border-[#2a2a3d] rounded-2xl p-8 text-center shadow-2xl">
            <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h2 className="font-heading text-2xl font-bold text-[#f1f5f9] mb-3">
              Something went wrong
            </h2>
            <p className="text-[#94a3b8] text-sm mb-8 leading-relaxed">
              We encountered an unexpected error while trying to render this section. 
              Our team has been notified.
            </p>
            <button
              onClick={this.handleReset}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#1a1a28] border border-[#2a2a3d] text-[#f1f5f9] font-semibold hover:bg-[#2a2a3d] transition-all duration-200"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary

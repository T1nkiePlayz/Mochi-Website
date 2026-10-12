import { Component, type ErrorInfo, type ReactNode } from 'react'

type Props = { children: ReactNode }
type State = { error: Error | null }

/**
 * Without this, a failed lazy chunk or a render error unmounts the whole tree and the page goes
 * blank (there is no outer boundary either). `key`ed on the route by its caller so navigating
 * away clears the error.
 */
export default class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled UI error:', error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    return (
      <div className="mx-auto max-w-xl py-16">
        <div className="glass-card p-8 text-center">
          <h1 className="text-2xl font-bold text-white">Something went wrong</h1>
          <p className="mt-3 text-sm leading-6 text-slate-400">
            This part of the site could not be loaded. That usually means the connection dropped
            while fetching the page, or an unexpected error occurred.
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-full bg-gradient-to-r from-violet-500 to-cyan-400 px-5 py-2.5 font-semibold text-white shadow-lg shadow-violet-500/25 transition hover:brightness-110"
            >
              Reload page
            </button>
            <a
              href={`./`}
              onClick={(event) => {
                // Stay in the SPA: clear the error and go home without a full reload.
                event.preventDefault()
                this.setState({ error: null })
                window.location.hash = '#/'
              }}
              className="rounded-full border border-white/15 bg-white/5 px-5 py-2.5 font-semibold text-slate-100 transition hover:border-violet-400/40 hover:bg-white/10"
            >
              Go to home
            </a>
          </div>
        </div>
      </div>
    )
  }
}

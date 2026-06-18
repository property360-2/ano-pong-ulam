"use client"

import { Component, type ReactNode } from "react"
import { MdErrorOutline } from "react-icons/md"

type Props = { children: ReactNode; fallback?: ReactNode }
type State = { hasError: boolean }

export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    console.error("ErrorBoundary caught:", error)
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <MdErrorOutline className="text-3xl text-stone-300 mb-2" />
            <p className="text-sm text-stone-500">Something went wrong loading this section.</p>
            <button
              onClick={() => this.setState({ hasError: false })}
              className="mt-3 text-sm text-amber-600 hover:underline"
            >
              Try again
            </button>
          </div>
        )
      )
    }

    return this.props.children
  }
}

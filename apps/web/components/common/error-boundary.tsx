"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";
import { AppErrorState } from "./error-state";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallbackTitle?: string;
  fallbackMessage?: string;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    if (process.env.NODE_ENV !== "production") {
      console.error("React error boundary caught an error", error, errorInfo);
    }
  }

  private retry = () => {
    this.setState({ hasError: false });
  };

  render() {
    if (this.state.hasError) {
      return (
        <AppErrorState
          title={this.props.fallbackTitle ?? "We could not load this section"}
          message={
            this.props.fallbackMessage ??
            "Please try again. If the problem continues, return to the previous page."
          }
          onRetry={this.retry}
          homeHref="/"
        />
      );
    }

    return this.props.children;
  }
}
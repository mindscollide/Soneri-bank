// components/GlobalErrorBoundary.jsx
import React from "react";

class GlobalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI.
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You can log any error to an error reporting service
    console.error("Application Error:", error, errorInfo);
    // Example: logErrorToService(error, errorInfo);
  }

  // Helper function to check if it's a CSS preload error
  isCSSPreloadError(error) {
    return error.message && error.message.includes("Unable to preload CSS");
  }

  // Helper function to check if it's a chunk load error (common with code splitting)
  isChunkLoadError(error) {
    return error.name === "ChunkLoadError";
  }

  // Helper function to check if it's a network error
  isNetworkError(error) {
    return (
      error.message &&
      (error.message.includes("Failed to fetch") ||
        error.message.includes("NetworkError") ||
        error.message.includes("Load failed"))
    );
  }

  handleRetry = () => {
    // Clear state and reload the app
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  handleContinue = () => {
    // Just hide the error UI but keep the state
    // Useful for non-critical errors like CSS preload failures
    this.setState({ hasError: false });
  };

  renderErrorDetails() {
    const { error } = this.state;

    if (this.isCSSPreloadError(error)) {
      return (
        <div>
          <h2>Style Loading Issue</h2>
          <p>
            The styles didn't load properly. The page might look unusual but
            should still work.
          </p>
          <button onClick={this.handleContinue}>Continue Anyway</button>
          <button onClick={this.handleRetry}>Try Again</button>
        </div>
      );
    }

    if (this.isChunkLoadError(error) || this.isNetworkError(error)) {
      return (
        <div>
          <h2>Connection Problem</h2>
          <p>
            There was a problem loading the application. This might be due to a
            poor network connection.
          </p>
          <button onClick={this.handleRetry}>Reload Application</button>
        </div>
      );
    }

    // Generic error message for any other type of error
    return (
      <div>
        <h2>Something Went Wrong</h2>
        <p>An unexpected error occurred. Our team has been notified.</p>
        <details
          style={{ whiteSpace: "pre-wrap", textAlign: "left", margin: "1em 0" }}
        >
          <summary>Error Details (for support)</summary>
          {error.toString()}
        </details>
        <button onClick={this.handleRetry}>Reload Application</button>
      </div>
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            fontFamily: "system-ui, sans-serif",
            minHeight: "100vh",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {this.renderErrorDetails()}
        </div>
      );
    }

    return this.props.children;
  }
}

export default GlobalErrorBoundary;

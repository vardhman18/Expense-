import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null, errorInfo: null };
    }

    static getDerivedStateFromError(error) {
        // Update state so the next render will show the fallback UI.
        return { hasError: true };
    }

    componentDidCatch(error, errorInfo) {
        // You can also log the error to an error reporting service
        this.setState({
            error: error,
            errorInfo: errorInfo
        });
    }

    render() {
        if (this.state.hasError) {
            // You can render any custom fallback UI
            return (
                <div className="min-h-screen bg-gradient-to-b from-gray-900 to-gray-800 flex items-center justify-center p-4">
                    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 max-w-lg w-full">
                        <div className="text-center">
                            <h2 className="text-xl font-medium text-gray-200 mb-4">
                                Something went wrong
                            </h2>
                            <p className="text-gray-400 mb-6">
                                We're sorry, but there was an error loading this component. 
                                Please try refreshing the page.
                            </p>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium transition-all hover:bg-blue-600 hover:shadow-lg hover:shadow-blue-500/20"
                            >
                                Refresh Page
                            </button>
                        </div>
                        
                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="mt-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                                <p className="text-sm font-medium text-red-400 mb-2">
                                    Error Details:
                                </p>
                                <pre className="text-xs text-gray-400 overflow-auto">
                                    {this.state.error.toString()}
                                </pre>
                                {this.state.errorInfo && (
                                    <pre className="text-xs text-gray-400 overflow-auto mt-2">
                                        {this.state.errorInfo.componentStack}
                                    </pre>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary; 
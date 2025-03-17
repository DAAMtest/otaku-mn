import React, { Component, type PropsWithChildren } from 'react';
import { View, Text } from 'react-native';

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * ErrorBoundary component catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of crashing the whole app
 */
class ErrorBoundary extends Component<PropsWithChildren, State> {
  constructor(props: PropsWithChildren) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    console.error('ErrorBoundary caught an error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 justify-center items-center p-5 bg-neutral-900 dark:bg-neutral-800">
          <Text className="text-xl font-bold text-red-500 mb-2">Something went wrong</Text>
          <Text className="text-base text-neutral-300 dark:text-neutral-200 text-center">{this.state.error?.message}</Text>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

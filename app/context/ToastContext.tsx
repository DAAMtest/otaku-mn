import React, { createContext, useContext, useState, useCallback } from 'react';
import type { PropsWithChildren } from 'react';
import Toast, { ToastType } from '@/components/Toast';

interface ToastContextType {
  showToast: (message: string, type?: ToastType, duration?: number) => void;
  hideToast: () => void;
}

interface ToastState {
  visible: boolean;
  message: string;
  type: ToastType;
  duration: number;
}

const ToastContext = createContext<ToastContextType>({
  showToast: () => {},
  hideToast: () => {},
});

/**
 * ToastProvider component that manages toast notifications
 * Provides methods to show and hide toasts
 */
export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ToastState>({
    visible: false,
    message: '',
    type: 'info',
    duration: 3000,
  });

  const showToast = useCallback((message: string, type: ToastType = 'info', duration: number = 3000) => {
    setToast({
      visible: true,
      message,
      type,
      duration,
    });
  }, []);

  const hideToast = useCallback(() => {
    setToast(prev => ({
      ...prev,
      visible: false,
    }));
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, hideToast }}>
      {children}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        duration={toast.duration}
        onClose={hideToast}
      />
    </ToastContext.Provider>
  );
}

/**
 * Custom hook to access the toast context
 * @returns The toast context with showToast and hideToast methods
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

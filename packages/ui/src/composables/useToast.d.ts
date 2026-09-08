export interface ToastState {
  visible: boolean
  message: string
  title: string
  tone: 'success' | 'error' | 'warning' | 'info'
  remainingTime: number
}

export interface ToastOptions {
  duration?: number
}

export interface ToastApi {
  toastState: ToastState
  show: (tone?: ToastState['tone'], value?: unknown, options?: ToastOptions) => void
  success: (value?: unknown, options?: ToastOptions) => void
  error: (value?: unknown, options?: ToastOptions) => void
  warning: (value?: unknown, options?: ToastOptions) => void
  info: (value?: unknown, options?: ToastOptions) => void
  pause: () => void
  resume: () => void
  dismiss: () => void
}

export function useToast(): ToastApi

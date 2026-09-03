/** Tailwind 3 preset for @its-enpii/ui. Values intentionally bind to Enpii tokens. */
const colors = {
  primary: 'var(--enpii-color-primary)',
  'primary-hover': 'var(--enpii-color-primary-hover)',
  'primary-text': 'var(--enpii-color-primary-text)',
  'primary-border': 'var(--enpii-color-primary-border)',
  accent: 'var(--enpii-color-tertiary)',
  surface: 'var(--enpii-color-surface)',
  ink: 'var(--enpii-color-on-surface)',
  'on-surface': 'var(--enpii-color-on-surface)',
  'on-surface-variant': 'var(--enpii-color-on-surface-variant)',
  outline: 'var(--enpii-color-outline)',
  error: 'var(--enpii-color-error)',
  danger: 'var(--enpii-color-error)',
  warning: 'var(--enpii-color-warning-text)',
  success: 'var(--enpii-color-success-text)',
  neutral: 'var(--enpii-color-neutral-text)',
};

const preset = {
  darkMode: ['selector', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors,
      fontFamily: {
        sans: 'var(--enpii-font-sans)',
      },
      borderRadius: {
        control: 'var(--enpii-radius-control)',
        card: 'var(--enpii-radius-card)',
        overlay: 'var(--enpii-radius-overlay)',
      },
      boxShadow: {
        control: 'var(--enpii-shadow-control)',
        raised: 'var(--enpii-shadow-raised)',
        overlay: 'var(--enpii-shadow-overlay)',
        DEFAULT: 'var(--enpii-shadow-md)',
        sm: 'var(--enpii-shadow-md)',
        md: 'var(--enpii-shadow-md)',
        lg: 'var(--enpii-shadow-lg)',
        xl: 'var(--enpii-shadow-xl)',
      },
    },
  },
};

export default preset;

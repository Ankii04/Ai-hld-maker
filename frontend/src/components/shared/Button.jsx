import { forwardRef } from 'react'

/**
 * The one button component for app chrome (dashboard, editor, modals).
 *
 * variant: 'primary' | 'secondary' | 'ghost' | 'danger'
 * size:    'md' (default) | 'sm'
 *
 * Styling lives in index.css (.btn / .btn-*) so the same grammar is
 * available to the few places that can't use the component directly.
 * No glow on any state — glow is reserved for the AI-generating state.
 */
const Button = forwardRef(function Button(
  { variant = 'primary', size = 'md', className = '', children, ...props },
  ref
) {
  const classes = [
    'btn',
    `btn-${variant}`,
    size === 'sm' ? 'btn-sm' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button ref={ref} className={classes} {...props}>
      {children}
    </button>
  )
})

export default Button

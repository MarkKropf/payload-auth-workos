'use client'

import React from 'react'

export interface LoginButtonProps {
  /**
   * The endpoint to redirect to for login
   */
  href: string

  /**
   * The button label
   * @default 'Login'
   */
  label?: string

  /**
   * Additional CSS classes to apply to the button
   */
  className?: string

  /**
   * Custom styles to apply to the button (optional)
   * Note: Using className is preferred to maintain Payload's design consistency
   */
  style?: React.CSSProperties
}

/**
 * Default login button component for Payload admin panel
 * Uses Payload's native button classes to match the design system
 */
export const LoginButton: React.FC<LoginButtonProps> = ({
  href,
  label = 'Login',
  className,
  style,
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    window.location.href = href
  }

  // Combine Payload's button classes with any custom classes
  const buttonClasses = [
    'btn',
    'btn--style-primary',
    'btn--icon-style-without-border',
    'btn--size-medium',
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        marginTop: '1rem',
        marginBottom: '1rem',
      }}
    >
      <a
        className={buttonClasses}
        href={href}
        onClick={handleClick}
        style={style}
        type="button"
      >
        <span className="btn__content">
          <span className="btn__label">{label}</span>
        </span>
      </a>
    </div>
  )
}

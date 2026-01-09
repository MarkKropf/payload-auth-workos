'use client'

import { Link, LogOutIcon, useTranslation } from '@payloadcms/ui'
import React from 'react'

const baseClass = 'nav'

export interface LogoutButtonProps {
  /**
   * The endpoint to redirect to for logout
   */
  href: string
  tabIndex?: number
}

export const LogoutButton: React.FC<LogoutButtonProps> = ({ href, tabIndex = 0 }) => {
  const { t } = useTranslation()

  return (
    <Link
      aria-label={t('authentication:logOut')}
      className={`${baseClass}__log-out`}
      href={href}
      prefetch={false}
      tabIndex={tabIndex}
      title={t('authentication:logOut')}
    >
      <LogOutIcon />
    </Link>
  )
}

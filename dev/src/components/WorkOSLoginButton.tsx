'use client'

import React from 'react'
import { LoginButton } from 'payload-auth-workos/client'

const WorkOSLoginButton = () => {
  return (
    <LoginButton
      href="/api/admin/auth/signin"
      label="Sign in with WorkOS"
    />
  )
}

export default WorkOSLoginButton

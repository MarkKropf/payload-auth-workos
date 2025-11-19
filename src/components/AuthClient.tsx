'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AuthContextType<T = any> {
  user: T | null
  setUser: (user: T | null) => void
}

const AuthContext = createContext<AuthContextType | null>(null)

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AuthProviderProps<T = any> {
  children: React.ReactNode
  user: T | null
}

/**
 * AuthProvider component to provide the user session to the application
 * 
 * @example
 * // In your RootLayout or a parent Server Component:
 * const { user } = await payload.auth({ headers: req.headers })
 * 
 * return (
 *   <AuthProvider user={user}>
 *     {children}
 *   </AuthProvider>
 * )
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const AuthProvider = <T = any>({ children, user: initialUser }: AuthProviderProps<T>) => {
  const [user, setUser] = useState<T | null>(initialUser)

  // Update local state if the server-provided user changes
  useEffect(() => {
    setUser(initialUser)
  }, [initialUser])

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to access the current user session
 * 
 * @example
 * const { user } = useAuth()
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const useAuth = <T = any>() => {
  const context = useContext(AuthContext)
  if (context === null) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context as AuthContextType<T>
}

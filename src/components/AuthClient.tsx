'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AuthContextType<T = any> {
  user: T | null
  setUser: (user: T | null) => void
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface AuthProviderProps<T = any> {
  children: React.ReactNode
  user: T | null
}

/**
 * Creates a new Auth client with its own Context, Provider, and Hook.
 * This is useful when you have multiple auth scopes (e.g., 'admin' and 'app') in the same application.
 * 
 * @param slug - Optional slug to identify the context (useful for debugging)
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const createAuthClient = <T = any>(slug?: string) => {
  const Context = createContext<AuthContextType<T> | null>(null)
  if (slug) {
    Context.displayName = `AuthContext(${slug})`
  }

  /**
   * AuthProvider component to provide the user session to the application
   */
  const AuthProvider = ({ children, user: initialUser }: AuthProviderProps<T>) => {
    const [user, setUser] = useState<T | null>(initialUser)

    // Update local state if the server-provided user changes
    useEffect(() => {
      setUser(initialUser)
    }, [initialUser])

    return (
      <Context.Provider value={{ user, setUser }}>
        {children}
      </Context.Provider>
    )
  }

  /**
   * Hook to access the current user session
   */
  const useAuth = () => {
    const context = useContext(Context)
    if (context === null) {
      throw new Error(`useAuth must be used within an AuthProvider${slug ? ` for ${slug}` : ''}`)
    }
    return context
  }

  return {
    AuthProvider,
    useAuth,
    Context,
  }
}

// Create a default client for general use
const defaultClient = createAuthClient()

export const AuthProvider = defaultClient.AuthProvider
export const useAuth = defaultClient.useAuth

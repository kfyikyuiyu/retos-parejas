import { createContext, useState, useContext, useEffect } from 'react'

const AuthContext = createContext(null)

const generateUserCode = () => {
  return 'USR-' + Math.random().toString(36).substring(2, 10).toUpperCase()
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const savedUser = localStorage.getItem('user')
    if (savedUser) setUser(JSON.parse(savedUser))
    setLoading(false)
  }, [])

  useEffect(() => {
    if (user) localStorage.setItem('user', JSON.stringify(user))
  }, [user])

  const login = async (email, password) => {
    setLoading(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      if (!email || !password) throw new Error('Todos los campos son requeridos')
      if (password.length < 6) throw new Error('Contraseña inválida')

      const storedUser = localStorage.getItem(`user_${email}`)
      let userData
      if (storedUser) {
        userData = JSON.parse(storedUser)
      } else {
        userData = {
          id: Date.now().toString(),
          name: email.split('@')[0],
          email,
          avatar: '/images/default-avatar.png',
          code: generateUserCode(),
          partnerCode: null,
          createdAt: new Date().toISOString()
        }
        localStorage.setItem(`user_${email}`, JSON.stringify(userData))
      }
      setUser(userData)
      return userData
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const register = async (name, email, password, partnerEmail) => {
    setLoading(true)
    setError(null)
    try {
      await new Promise(resolve => setTimeout(resolve, 1500))
      if (!name || !email || !password) throw new Error('Todos los campos son requeridos')

      const userCode = generateUserCode()
      const userData = {
        id: Date.now().toString(),
        name,
        email,
        avatar: '/images/default-avatar.png',
        code: userCode,
        partnerCode: null,
        partnerEmail: partnerEmail || null,
        createdAt: new Date().toISOString()
      }
      localStorage.setItem(`user_${email}`, JSON.stringify(userData))
      setUser(userData)
      return userData
    } catch (err) {
      setError(err.message)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const setPartnerCode = (code) => {
    if (!user) return
    const updatedUser = { ...user, partnerCode: code }
    setUser(updatedUser)
    localStorage.setItem(`user_${user.email}`, JSON.stringify(updatedUser))
  }

  const logout = () => {
    setUser(null)
    localStorage.removeItem('user')
  }

  const value = { user, loading, error, login, register, logout, setPartnerCode }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth debe usarse dentro de AuthProvider')
  return context
}

export default AuthContext
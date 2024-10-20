"use client"
import { createContext, ReactNode, useContext, useEffect, useState } from "react"

const ThemeContext = createContext({
  theme: 'light',
  toggleTheme: () => {},
})

interface ThemeProviderProps {
  children: ReactNode; // This will type the children prop correctly
}

export const ThemeProvider = ({ children }: ThemeProviderProps) => {
  const [theme, setTheme] = useState('light')

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'))
  }

  useEffect(() => {
    document.body.className = theme
  }, [theme])

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

export const useTheme = () => useContext(ThemeContext)

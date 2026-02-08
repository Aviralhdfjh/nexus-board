import { useState, useCallback, useEffect } from 'react'

const STORAGE_KEY = 'nexus-color-history'
const MAX_HISTORY = 6

/**
 * Hook to manage color history with localStorage persistence
 * Maintains the last 6 colors used by the user
 */
export function useColorHistory() {
  const [colors, setColors] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        setColors(JSON.parse(saved))
      } catch {
        setColors([])
      }
    }
    setMounted(true)
  }, [])

  // Add color to history
  const addColor = useCallback((color: string) => {
    setColors((prev) => {
      // Remove if already exists, then add to front
      const filtered = prev.filter((c) => c.toLowerCase() !== color.toLowerCase())
      const updated = [color, ...filtered].slice(0, MAX_HISTORY)

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      }

      return updated
    })
  }, [])

  // Clear history
  const clearHistory = useCallback(() => {
    setColors([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  return {
    colors: mounted ? colors : [],
    addColor,
    clearHistory,
  }
}

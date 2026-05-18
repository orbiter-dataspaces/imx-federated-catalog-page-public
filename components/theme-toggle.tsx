'use client'

import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import { Button } from '@/components/ui/button'

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  const handleToggle = () => {
    setTheme(isDark ? 'light' : 'dark')
  }

  const Icon = isDark ? Sun : Moon
  const nextThemeLabel = isDark ? 'Switch to light mode' : 'Switch to dark mode'

  return (
    <Button
      variant="outline"
      size="icon"
      className="shrink-0"
      onClick={handleToggle}
      aria-label={nextThemeLabel}
    >
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only">{nextThemeLabel}</span>
    </Button>
  )
}

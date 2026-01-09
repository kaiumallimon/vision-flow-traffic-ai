'use client'

import React from 'react'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useMobileMenu } from '@/app/dashboard/layout'

/**
 * FrostedHeader: Reusable frosted glass header component
 * @param {Object} props
 * @param {string} props.title - main header text
 * @param {string} [props.subtitle] - optional smaller text below title
 * @param {React.ReactNode} [props.children] - optional extra content (buttons, icons)
 * @param {string} [props.className] - additional Tailwind classes
 */
export const FrostedHeader = ({
  title,
  subtitle,
  children,
  className = '',
}) => {
  const toggleMobileMenu = useMobileMenu()

  return (
    <div
      className={`sticky top-0 z-20 bg-white/40 dark:bg-background/40 backdrop-blur-md border-b border-border/50 p-4 md:p-4 will-change-transform ${className}`}
      style={{ transform: 'translateZ(0)' }}
    >
      <div className="flex items-center justify-between gap-4">
        {/* Left side - Mobile menu button + Title */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          {/* Mobile menu button - always visible on mobile */}
          <Button
            variant="ghost"
            size="sm"
            className="md:hidden p-2 h-8 w-8"
            onClick={toggleMobileMenu || undefined}
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" />
          </Button>

          {/* Title section */}
          <div className="min-w-0 flex-1">
            <h1 className="text-xl md:text-2xl font-bold text-foreground truncate">
              {title}
            </h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground mt-1 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right side - Additional children */}
        {children && <div className="flex items-center gap-2 shrink-0">{children}</div>}
      </div>
    </div>
  )
}

'use client'

import { createContext, useContext, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ImageIcon,
  History,
  User as UserIcon,
  LogOut,
  Menu,
  Camera,
  BarChart3,
  Download
} from 'lucide-react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'

const MobileMenuContext = createContext(null)
export const useMobileMenu = () => useContext(MobileMenuContext)

export default function DashboardLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login')
    }
  }, [isAuthenticated, isLoading, router])

  const handleSignOut = () => {
    logout()
    router.push('/login')
  }

  const isActive = (path) => pathname === path

  const NavItem = ({ href, icon: Icon, label, onClick }) => (
    <Link
      href={href}
      onClick={onClick}
      className={`flex items-center gap-3 rounded-md p-2 text-sm transition-all hover:bg-primary/10 ${
        isActive(href) ? 'bg-primary text-primary-foreground font-semibold' : ''
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  )

  const SidebarContent = ({ onLinkClick }) => (
    <div className="flex h-full w-full flex-col overflow-hidden bg-card">
      {/* Header */}
      <div className="border-b p-4">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Camera className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">Traffic AI</p>
            <p className="text-xs text-muted-foreground">Dashboard</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        <div>
          <p className="px-2 mb-2 text-xs uppercase text-muted-foreground">
            Overview
          </p>
          <NavItem
            href="/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
            onClick={onLinkClick}
          />
        </div>

        <div>
          <p className="px-2 mb-2 text-xs uppercase text-muted-foreground">
            Analysis
          </p>
          <div className="space-y-1">
            <NavItem
              href="/dashboard/analyze"
              icon={ImageIcon}
              label="Analyze Image"
              onClick={onLinkClick}
            />
            <NavItem
              href="/dashboard/analytics"
              icon={BarChart3}
              label="Analytics"
              onClick={onLinkClick}
            />
            <NavItem
              href="/dashboard/history"
              icon={History}
              label="History"
              onClick={onLinkClick}
            />
            <NavItem
              href="/dashboard/export"
              icon={Download}
              label="Export Data"
              onClick={onLinkClick}
            />
          </div>
        </div>

        <div>
          <p className="px-2 mb-2 text-xs uppercase text-muted-foreground">
            Account
          </p>
          <NavItem
            href="/dashboard/profile"
            icon={UserIcon}
            label="Profile Settings"
            onClick={onLinkClick}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="border-t p-4">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 rounded-md p-3 text-sm text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          Sign Out
        </button>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Camera className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!isAuthenticated) return null

  return (
    <MobileMenuContext.Provider value={() => setMobileMenuOpen(true)}>
      <div className="flex h-screen overflow-hidden bg-background">
        {/* Desktop Sidebar */}
        <aside className="hidden md:flex w-52 border-r">
          <SidebarContent />
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent side="left" className="p-0 w-52">
            <SheetTitle className="sr-only">Menu</SheetTitle>
            <SidebarContent onLinkClick={() => setMobileMenuOpen(false)} />
          </SheetContent>
        </Sheet>

        {/* Main */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <header className="md:hidden border-b p-4 flex items-center gap-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>
            <span className="font-semibold text-sm">Traffic AI</span>
          </header>

          <main className="flex-1 overflow-y-auto p-4 md:p-6">
            {children}
          </main>
        </div>
      </div>
    </MobileMenuContext.Provider>
  )
}

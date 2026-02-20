'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ShieldCheck,
  Users,
  ClipboardList,
  LogOut,
  Menu,
  Camera,
} from 'lucide-react'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { Badge } from '@/components/ui/badge'

export default function AdminDashboardLayout({ children }) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Auth guard – only ADMIN allowed
  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login')
      } else if (user?.role !== 'ADMIN') {
        router.replace('/dashboard')
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  const handleSignOut = () => {
    logout()
    router.push('/login')
  }

  const isActive = (path) => {
    if (path === '/admin/dashboard') return pathname === '/admin/dashboard'
    return pathname === path || pathname.startsWith(path + '/')
  }

  const NavItem = ({ href, icon: Icon, label }) => (
    <Link
      href={href}
      className={`flex items-center gap-3 rounded-md p-2 text-sm transition-all hover:bg-primary/10 ${
        isActive(href)
          ? 'bg-primary text-primary-foreground font-semibold'
          : 'text-foreground'
      }`}
    >
      <Icon className="h-4 w-4 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  )

  const SidebarContent = ({ onLinkClick }) => (
    <div className="flex h-full w-full flex-col overflow-hidden bg-card">
      {/* Header */}
      <div className="border-b p-4 bg-red-50 dark:bg-red-950/20">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-lg bg-red-100 dark:bg-red-900/40 flex items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <p className="text-sm font-semibold">Admin Panel</p>
            <Badge variant="destructive" className="text-xs px-1 py-0 h-4">
              ADMIN
            </Badge>
          </div>
        </div>
        {user && (
          <p className="text-xs text-muted-foreground mt-2 truncate">
            {user.first_name || user.firstName} {user.last_name || user.lastName}
          </p>
        )}
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto p-2 space-y-4">
        <div>
          <p className="px-2 mb-2 text-xs uppercase text-muted-foreground">
            Overview
          </p>
          <NavItem
            href="/admin/dashboard"
            icon={LayoutDashboard}
            label="Dashboard"
            onClick={onLinkClick}
          />
        </div>

        <div>
          <p className="px-2 mb-2 text-xs uppercase text-muted-foreground">
            Management
          </p>
          <div className="space-y-1">
            <NavItem
              href="/admin/dashboard/orders"
              icon={ClipboardList}
              label="Orders"
              onClick={onLinkClick}
            />
            <NavItem
              href="/admin/dashboard/users"
              icon={Users}
              label="Users"
              onClick={onLinkClick}
            />
          </div>
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

  if (!isAuthenticated || user?.role !== 'ADMIN') return null

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex w-52 border-r">
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar */}
      <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
        <SheetContent side="left" className="p-0 w-52">
          <SheetTitle className="sr-only">Admin Menu</SheetTitle>
          <SidebarContent onLinkClick={() => setMobileMenuOpen(false)} />
        </SheetContent>
      </Sheet>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="md:hidden border-b p-4 flex items-center gap-3 bg-red-50 dark:bg-red-950/20">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileMenuOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <ShieldCheck className="h-4 w-4 text-red-600" />
          <span className="font-semibold text-sm">Admin Panel</span>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

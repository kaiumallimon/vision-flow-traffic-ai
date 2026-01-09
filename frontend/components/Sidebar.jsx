'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import {
  Home,
  HistoryIcon,
  Settings,
  LogOut,
  Zap,
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
    // Use window.location for a full page reload to clear any cached state
    window.location.href = '/login';
  };

  const SidebarContent = ({ onLinkClick }) => (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="border-b border-border/40 p-4 shrink-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="relative w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Zap className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col min-w-0">
            <span className="text-sm font-semibold leading-none truncate">Vision Flow</span>
            <span className="text-xs text-muted-foreground truncate">Traffic AI</span>
          </div>
        </div>
      </div>

      {/* Content - Scrollable Area */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-2">
        {/* Main Navigation */}
        <div>
          <div className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wider px-2 mb-2 truncate">
            Overview
          </div>
          <div>
            <Link
              href="/dashboard"
              onClick={onLinkClick}
              className={`flex items-center gap-3 rounded-md p-2 text-sm transition-all duration-200 hover:bg-primary/10 ${
                pathname === '/dashboard' ? 'bg-primary text-primary-foreground font-semibold' : ''
              }`}
            >
              <Home className="h-4 w-4 shrink-0" />
              <span className="font-medium truncate">Dashboard</span>
            </Link>
          </div>
        </div>

        <div className="my-4 h-px bg-border"></div>

        {/* Analysis */}
        <div>
          <div className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wider px-2 mb-2 truncate">
            Analysis
          </div>
          <div className="space-y-1">
            <Link
              href="/dashboard/analyze"
              onClick={onLinkClick}
              className={`flex items-center gap-3 rounded-md p-2 text-sm transition-all duration-200 hover:bg-primary/10 ${
                pathname === '/dashboard/analyze' ? 'bg-primary text-primary-foreground font-semibold' : ''
              }`}
            >
              <Zap className="h-4 w-4 shrink-0" />
              <span className="font-medium truncate">Analyze Image</span>
            </Link>
            <Link
              href="/dashboard/history"
              onClick={onLinkClick}
              className={`flex items-center gap-3 rounded-md p-2 text-sm transition-all duration-200 hover:bg-primary/10 ${
                pathname === '/dashboard/history' ? 'bg-primary text-primary-foreground font-semibold' : ''
              }`}
            >
              <HistoryIcon className="h-4 w-4 shrink-0" />
              <span className="font-medium truncate">History</span>
            </Link>
          </div>
        </div>

        <div className="my-4 h-px bg-border"></div>

        {/* Settings */}
        <div>
          <div className="text-xs font-medium text-muted-foreground/80 uppercase tracking-wider px-2 mb-2 truncate">
            Settings
          </div>
          <div className="space-y-1">
            <Link
              href="/dashboard/profile"
              onClick={onLinkClick}
              className={`flex items-center gap-3 rounded-md p-2 text-sm transition-all duration-200 hover:bg-primary/10 ${
                pathname === '/dashboard/profile' ? 'bg-primary text-primary-foreground font-semibold' : ''
              }`}
            >
              <Settings className="h-4 w-4 shrink-0" />
              <span className="font-medium truncate">Profile</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-border/40 p-4 shrink-0 overflow-hidden">
        {/* User Profile */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-start gap-3 p-3 rounded-md hover:bg-primary/10 transition-colors overflow-hidden border-0 bg-transparent cursor-pointer"
        >
          <div className="flex items-center gap-3 min-w-0 flex-1 overflow-hidden">
            <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium shrink-0 ring-2 ring-border">
              {user?.first_name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="flex flex-col items-start min-w-0 overflow-hidden">
              <span className="text-sm font-medium truncate max-w-full">
                {user?.first_name && user?.last_name ? `${user.first_name} ${user.last_name}` : 'User'}
              </span>
              <span className="text-xs text-muted-foreground truncate max-w-full">
                {user?.email || ''}
              </span>
            </div>
          </div>
          <LogOut className="h-4 w-4 shrink-0" />
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-screen w-64 bg-card border-r border-border/40 shadow-lg transition-transform duration-300 z-50 lg:relative lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <SidebarContent onLinkClick={onClose} />
      </aside>
    </>
  );
}

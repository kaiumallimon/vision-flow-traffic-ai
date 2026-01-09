'use client';

import './globals.css';
import { AuthProvider } from '@/lib/auth-context';

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Vision Flow AI - Traffic Detection</title>
        <meta name="description" content="AI-powered traffic detection and analysis with real-time insights" />
      </head>
      <body className="bg-slate-50">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

import './globals.css';

export const metadata = {
  title: 'Vision Flow AI',
  description: 'AI-powered traffic detection and analysis',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="bg-slate-50">{children}</body>
    </html>
  );
}

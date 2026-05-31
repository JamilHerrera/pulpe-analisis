import type { ReactNode } from 'react';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white min-h-screen rounded-3xl shadow-2xl shadow-slate-300 overflow-hidden relative">
        {children}
      </div>
    </div>
  );
}

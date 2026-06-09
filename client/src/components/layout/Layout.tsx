import { ReactNode } from "react";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: ReactNode;
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
}

export default function Layout({ children, title, subtitle, actions }: LayoutProps) {
  return (
    <div className="flex h-screen bg-dark-900 bg-mesh">
      <Sidebar />
      <main className="flex-1 ml-64 flex flex-col min-h-screen overflow-hidden">
        {(title || actions) && (
          <header className="px-8 py-5 border-b border-white/10 bg-dark-900/50 backdrop-blur-sm sticky top-0 z-20">
            <div className="flex items-center justify-between">
              <div>
                {title && <h1 className="text-xl font-bold text-white">{title}</h1>}
                {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
              </div>
              {actions && <div className="flex items-center gap-3">{actions}</div>}
            </div>
          </header>
        )}
        <div className="flex-1 overflow-y-auto px-8 py-6 animate-fade-in">{children}</div>
      </main>
    </div>
  );
}

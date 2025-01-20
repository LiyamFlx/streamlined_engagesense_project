import React, { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { 
  LayoutGrid, 
  Activity,
  Lightbulb,
  Menu,
  X
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: LayoutGrid, label: 'Dashboard', path: '/dashboard' },
  { icon: Activity, label: 'Analysis', path: '/analysis' },
  { icon: Lightbulb, label: 'Recommendations', path: '/recommendations' }
];

export const DJLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const location = useLocation();
  const isMobile = window.innerWidth < 768;

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-900 via-gray-900 to-black overflow-x-hidden">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-black/50 backdrop-blur-lg border-b border-white/10">
        <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 hover:bg-white/10 rounded-lg transition-all duration-200 active:scale-95 lg:hidden"
            >
              {isSidebarOpen ? <X /> : <Menu />}
            </button>
            <div className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-purple-400 animate-pulse" />
              <span className="text-lg sm:text-xl font-bold text-white">EngageSense</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
              <span className="hidden sm:inline text-sm text-white/70">Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className={`
        fixed top-16 left-0 bottom-0 z-40 w-full sm:w-64
        transition-transform duration-200 ease-in-out
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0
        bg-black/50 backdrop-blur-md border-r border-white/10
      `}>
        <nav className="p-4 space-y-2">
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
            <Link
              key={path}
              to={path}
              className={`
                flex items-center gap-3 px-4 py-4 sm:py-3 rounded-lg
                transition-colors relative group
                hover:bg-purple-500/10 active:bg-purple-500/20
                ${location.pathname === path 
                  ? 'bg-purple-500/20 text-white' 
                  : 'text-white/70 hover:bg-white/10'}
              `}
              onClick={() => isMobile && setIsSidebarOpen(false)}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
              {location.pathname === path && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-violet-500 rounded-r-full shadow-lg shadow-purple-500/20" />
              )}
              <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-xs text-white/50">{label}</span>
              </div>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className={`
        pt-20 sm:pt-16 min-h-screen transition-all duration-200
        px-4 sm:px-6 lg:px-8
        lg:pl-72
      `}>
        <div className="w-full max-w-7xl mx-auto">
          {children}
        </div>
      </main>

      {/* Mobile Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md border-t border-white/10">
        <div className="flex justify-around">
          {NAV_ITEMS.map(({ icon: Icon, label, path }) => (
            <Link
              key={path}
              to={path}
              className={`
                flex flex-col items-center gap-1 py-4 px-2
                ${location.pathname === path 
                  ? 'text-purple-400' 
                  : 'text-white/70'}
              `}
              onClick={() => setIsSidebarOpen(false)}
            >
              <Icon className="h-5 w-5" />
              <span className="text-xs truncate">{label}</span>
            </Link>
          ))}
        </div>
      </nav>
      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};
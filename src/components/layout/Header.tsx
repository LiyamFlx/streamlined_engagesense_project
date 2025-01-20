import React from 'react';
import { Music, Settings, Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

interface NavLinkProps {
  href: string;
  children: React.ReactNode;
  onScroll: (e: React.MouseEvent<HTMLAnchorElement>) => void;
}

const NavLink: React.FC<NavLinkProps> = ({ href, children, onScroll }) => (
  <a
    href={href}
    className="px-3 py-2 rounded-md text-sm font-medium text-white/70 hover:text-white hover:bg-white/10 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
    onClick={onScroll}
    role="menuitem"
  >
    {children}
  </a>
);

export const Header: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  const handleScroll = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    if (href?.startsWith('#')) {
      const element = document.querySelector(href);
      element?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white/10 backdrop-blur-lg border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Music className="h-8 w-8 text-purple-400" />
            <span className="ml-3 text-xl font-bold text-white">EngageSense</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-4" role="navigation" aria-label="Main navigation">
            <NavLink href="#dashboard" onScroll={handleScroll}>Dashboard</NavLink>
            <NavLink href="#analysis" onScroll={handleScroll}>Analysis</NavLink>
            <NavLink href="#recommendations" onScroll={handleScroll}>Recommendations</NavLink>
          </nav>

          <div className="flex items-center space-x-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-white" />
              ) : (
                <Moon className="h-5 w-5 text-white" />
              )}
            </button>
            <button
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              aria-label="Settings"
            >
              <Settings className="h-5 w-5 text-white" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
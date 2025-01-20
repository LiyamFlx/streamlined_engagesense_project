import React from 'react';
import { Header } from './Header';
import { Breadcrumbs } from './Breadcrumbs';
import { Container } from '../ui/Container';
import { VisuallyHidden } from '../ui/feedback/VisuallyHidden';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 via-purple-900 to-violet-900 overflow-x-hidden">
      <Header aria-label="Main navigation" />
      <main id="main-content" className="flex-1 w-full py-4 sm:py-8">
        <Container>
          <Breadcrumbs aria-label="Page navigation" />
          <div className="w-full">{children}</div>
        </Container>
      </main>
      <footer className="mt-auto py-4 sm:py-6 bg-black/20">
        <Container className="text-white/60 text-sm">
          © {new Date().getFullYear()} EngageSense. All rights reserved.
        </Container>
      </footer>
    </div>
  );
};
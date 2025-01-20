import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

export const Breadcrumbs: React.FC = () => {
  const location = useLocation();
  const pathnames = location.pathname.split('/').filter(x => x);

  return (
    <nav className="mb-6">
      <ol className="flex items-center space-x-2">
        <li>
          <Link to="/" className="text-white/70 hover:text-white">
            Home
          </Link>
        </li>
        {pathnames.map((name, index) => {
          const routeTo = `/${pathnames.slice(0, index + 1).join('/')}`;
          const isLast = index === pathnames.length - 1;

          return (
            <React.Fragment key={name}>
              <ChevronRight className="w-4 h-4 text-white/50" />
              <li>
                {isLast ? (
                  <span className="text-white font-medium capitalize">
                    {name}
                  </span>
                ) : (
                  <Link
                    to={routeTo}
                    className="text-white/70 hover:text-white capitalize"
                  >
                    {name}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
};
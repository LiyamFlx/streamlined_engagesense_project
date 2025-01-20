import React from 'react';
import { Home, ChevronLeft, ChevronRight, Filter, ZoomIn, ZoomOut, Download, RefreshCw } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';

interface NavigationControlsProps {
  onFilter?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onDownloadChart?: () => void;
  onRefresh?: () => void;
}

export const NavigationControls: React.FC<NavigationControlsProps> = ({
  onFilter,
  onZoomIn,
  onZoomOut,
  onDownloadChart,
  onRefresh
}) => {
  const navigate = useNavigate();
  const location = useLocation();

  const routes = ['/dashboard', '/analysis', '/recommendations'];
  const currentIndex = routes.indexOf(location.pathname);

  const goToNextPage = () => {
    if (currentIndex < routes.length - 1) {
      navigate(routes[currentIndex + 1]);
    }
  };

  const goToPreviousPage = () => {
    if (currentIndex > 0) {
      navigate(routes[currentIndex - 1]);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex flex-wrap items-center gap-3">
        {/* Navigation Group */}
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            icon={Home}
            onClick={() => navigate('/dashboard')}
            title="Go to Dashboard"
          >
            Home
          </Button>
          <Button
            variant="secondary"
            icon={ChevronLeft}
            onClick={goToPreviousPage}
            disabled={currentIndex <= 0}
            title="Previous Page"
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            icon={ChevronRight}
            onClick={goToNextPage}
            disabled={currentIndex >= routes.length - 1}
            title="Next Page"
          >
            Next
          </Button>
        </div>

        {/* Divider */}
        <div className="h-8 w-px bg-white/10" />

        {/* Chart Controls Group */}
        <div className="flex items-center gap-2">
          {onFilter && (
            <Button
              variant="secondary"
              icon={Filter}
              onClick={onFilter}
              title="Filter Results"
            >
              Filter
            </Button>
          )}
          {(onZoomIn || onZoomOut) && (
            <div className="flex items-center gap-1">
              {onZoomIn && (
                <Button
                  variant="secondary"
                  icon={ZoomIn}
                  onClick={onZoomIn}
                  title="Zoom In"
                >
                  Zoom In
                </Button>
              )}
              {onZoomOut && (
                <Button
                  variant="secondary"
                  icon={ZoomOut}
                  onClick={onZoomOut}
                  title="Zoom Out"
                >
                  Zoom Out
                </Button>
              )}
            </div>
          )}
          {onDownloadChart && (
            <Button
              variant="secondary"
              icon={Download}
              onClick={onDownloadChart}
              title="Download Chart"
            >
              Download Chart
            </Button>
          )}
        </div>

        {/* Refresh Button */}
        {onRefresh && (
          <>
            <div className="h-8 w-px bg-white/10" />
            <Button
              variant="secondary"
              icon={RefreshCw}
              onClick={onRefresh}
              title="Refresh Data"
            >
              Refresh
            </Button>
          </>
        )}
      </div>
    </Card>
  );
};
import React, { Suspense, useEffect, useState, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DJLayout } from './components/layout/DJLayout';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ErrorFallback } from './components/ErrorFallback';
import { initializeEnvironment } from './utils/initialization';
import Dashboard from './pages/Dashboard';
import Analysis from './pages/Analysis';
import Recommendations from './pages/Recommendations';

const LoadingState = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
  </div>
);

function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const initAttempts = useRef(0);
  const maxAttempts = 3;

  useEffect(() => {
    const initializeApp = async () => {
      try {
        setIsInitializing(true);
        await initializeEnvironment();
        setIsInitialized(true);
        setError(null);
      } catch (error) {
        console.error('App initialization failed:', error);
        setError(error instanceof Error ? error : new Error('Failed to initialize application'));
        
        if (initAttempts.current < maxAttempts) {
          initAttempts.current++;
          setTimeout(initializeApp, 1000 * initAttempts.current);
        } else {
          setError(new Error('Failed to initialize application after multiple attempts'));
        }
      } finally {
        setIsInitializing(false);
      }
    };

    initializeApp();
  }, []);

  if (isInitializing) {
    if (error) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-black">
          <div className="bg-red-500/20 backdrop-blur-sm rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-bold text-white mb-4">Initialization Failed</h2>
            <p className="text-white/70 mb-4">{error.message}</p>
            <button
              onClick={() => window.location.reload()}
              className="w-full sm:w-auto px-6 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }
    return <LoadingState />;
  }

  return (
    <ErrorBoundary fallback={<ErrorFallback />}>
      <BrowserRouter>
        <DJLayout>
          <Suspense fallback={<LoadingState />}>
            <Routes>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={
                <ErrorBoundary fallback={<ErrorFallback />}>
                  <Dashboard />
                </ErrorBoundary>
              } />
              <Route path="/analysis" element={
                <ErrorBoundary fallback={<ErrorFallback />}>
                  <Analysis />
                </ErrorBoundary>
              } />
              <Route path="/recommendations" element={
                <ErrorBoundary fallback={<ErrorFallback />}>
                  <Recommendations />
                </ErrorBoundary>
              } />
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Suspense>
        </DJLayout>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
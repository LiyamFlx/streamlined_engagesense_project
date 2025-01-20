// Environment initialization utilities
export const initializeEnvironment = (() => {
  let initialized = false;
  let initializationPromise: Promise<void> | null = null;
  let audioContext: AudioContext | null = null;

  return async () => {
    if (initialized) return;
    if (initializationPromise) return initializationPromise;

    initializationPromise = (async () => {
      try {
        // Ensure window is defined
        if (typeof window === 'undefined') {
          throw new Error('Window is not defined');
        }

        // Wait for DOM to be ready
        if (document.readyState !== 'complete') {
          await new Promise(resolve => {
            window.addEventListener('load', resolve, { once: true });
          });
        }

        // Initialize any required APIs
        await Promise.all([
          // Audio context initialization
          new Promise((resolve, reject) => {
            try {
              if (!audioContext || audioContext.state === 'closed') {
                audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
              }
              if (audioContext.state === 'suspended') {
                audioContext.resume();
              }
              audioContext.suspend().then(resolve).catch(reject);
            } catch (error) {
              console.error('Audio context initialization failed:', error);
              reject(error);
            }
          }),
          // Add other async initialization as needed
        ]);

        initialized = true;
      } catch (error) {
        console.error('Environment initialization failed:', error);
        throw error;
      } finally {
        initializationPromise = null;
      }
    })();

    return initializationPromise;
  };
})();

export const getAudioContext = () => {
  return audioContext;
};
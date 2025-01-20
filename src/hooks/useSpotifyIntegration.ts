import { useState, useEffect, useCallback } from 'react';
import { SpotifyService } from '../services/spotify/SpotifyService';
import type { TrackDetails } from '../types/spotify';

export const useSpotifyIntegration = (clientId: string) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tracks, setTracks] = useState<TrackDetails[]>([]);
  const spotifyServiceRef = useRef<SpotifyService>(new SpotifyService());

  useEffect(() => {
    let mounted = true;

    const initializeSpotify = async () => {
      if (!clientId) {
        setError('Spotify client ID is required');
        return;
      }

      try {
        await spotifyServiceRef.current.initialize(clientId);
        if (mounted) {
          setIsInitialized(true);
          setError(null);
        }
      } catch (err) {
        if (mounted) {
          setError('Failed to initialize Spotify integration');
          console.error(err);
        }
      }
    };

    initializeSpotify();

    return () => {
      mounted = false;
    };
  }, [clientId]);

  const searchTracks = useCallback(async (query: string) => {
    if (!isInitialized) {
      setError('Spotify not initialized');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const results = await spotifyServiceRef.current.searchTracks(query);
      setTracks(results);
    } catch (err) {
      setError('Failed to search tracks');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  }, [isInitialized]);

  const getTrackFeatures = useCallback(async (trackId: string) => {
    if (!isInitialized) {
      setError('Spotify not initialized');
      return null;
    }

    try {
      return await spotifyServiceRef.current.getTrackFeatures(trackId);
    } catch (err) {
      setError('Failed to get track features');
      console.error(err);
      return null;
    }
  }, [isInitialized]);

  return {
    isInitialized,
    isLoading,
    error,
    tracks,
    searchTracks,
    getTrackFeatures,
  };
};
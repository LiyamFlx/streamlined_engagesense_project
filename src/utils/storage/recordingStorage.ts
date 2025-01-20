import { AudioData } from '../../types/audio';

interface StoredRecording {
  id: number;
  timestamp: Date;
  frequency: Float32Array;
  amplitude: Float32Array;
  metrics: {
    physical: number;
    emotional: number;
    mental: number;
    spiritual: number;
  };
}

export const saveRecording = async (audioData: AudioData): Promise<void> => {
  try {
    // Create a cloneable version of the audio data
    const storedRecording: StoredRecording = {
      id: audioData.timeStamp,
      timestamp: new Date(),
      frequency: audioData.frequency,
      amplitude: audioData.amplitude,
      metrics: { ...audioData.metrics }
    };

    const db = await openDatabase();
    const transaction = db.transaction(['recordings'], 'readwrite');
    const store = transaction.objectStore('recordings');
    
    await store.put(storedRecording);
  } catch (error) {
    console.error('Failed to save recording:', error);
    throw error;
  }
};

export const getRecording = async (id: number): Promise<StoredRecording | undefined> => {
  const db = await openDatabase();
  const transaction = db.transaction(['recordings'], 'readonly');
  const store = transaction.objectStore('recordings');
  
  return new Promise((resolve, reject) => {
    const request = store.get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const openDatabase = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('engageSense', 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains('recordings')) {
        db.createObjectStore('recordings', { keyPath: 'id' });
      }
    };
  });
};
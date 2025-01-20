import { useState, useEffect } from 'react';

export const useEQProcessor = (audioContext: AudioContext | null) => {
  const [highFilter, setHighFilter] = useState<BiquadFilterNode | null>(null);
  const [midFilter, setMidFilter] = useState<BiquadFilterNode | null>(null);
  const [lowFilter, setLowFilter] = useState<BiquadFilterNode | null>(null);
  const [mainFilter, setMainFilter] = useState<BiquadFilterNode | null>(null);

  useEffect(() => {
    if (!audioContext) return;

    const high = audioContext.createBiquadFilter();
    high.type = 'highshelf';
    high.frequency.value = 10000;

    const mid = audioContext.createBiquadFilter();
    mid.type = 'peaking';
    mid.frequency.value = 1000;
    mid.Q.value = 1;

    const low = audioContext.createBiquadFilter();
    low.type = 'lowshelf';
    low.frequency.value = 100;

    const filter = audioContext.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 20000;

    setHighFilter(high);
    setMidFilter(mid);
    setLowFilter(low);
    setMainFilter(filter);

    // Connect filters in series
    high.connect(mid).connect(low).connect(filter).connect(audioContext.destination);

    return () => {
      high.disconnect();
      mid.disconnect();
      low.disconnect();
      filter.disconnect();
    };
  }, [audioContext]);

  const setEQ = (band: 'high' | 'mid' | 'low', value: number) => {
    const filter = {
      high: highFilter,
      mid: midFilter,
      low: lowFilter
    }[band];

    if (filter) {
      filter.gain.value = value;
    }
  };

  const setFilter = (frequency: number) => {
    if (mainFilter) {
      mainFilter.frequency.value = frequency;
    }
  };

  return { setEQ, setFilter };
};
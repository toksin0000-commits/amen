// app/[lang]/churches/useChurches.ts
import { useState } from 'react';
import { ChurchWithDistance, CacheData, Lang } from './church.types';
import { processElements } from './church.utils';

const churchCache = new Map<string, CacheData>();
const CACHE_DURATION = 3600000;

export const useChurches = (lang: Lang, t: any) => {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [nearbyChurches, setNearbyChurches] = useState<ChurchWithDistance[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState(false);
  const [notFound, setNotFound] = useState(false);
  const [lastLocationKey, setLastLocationKey] = useState<string | null>(null);

  const fetchChurches = async (latitude: number, longitude: number) => {
    const servers = [
      'https://overpass-api.de/api/interpreter',
      'https://lz4.overpass-api.de/api/interpreter',
      'https://z.overpass-api.de/api/interpreter'
    ];
    
    const radius = 5000;
    const fetchPromises = servers.map(async (server) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      
      try {
        const url = `${server}?data=[out:json];(node["amenity"="place_of_worship"](around:${radius},${latitude},${longitude});way["amenity"="place_of_worship"](around:${radius},${latitude},${longitude}););out center 10;`;
        const response = await fetch(url, { signal: controller.signal });
        clearTimeout(timeoutId);
        
        if (response.status === 429) throw { type: 'RATE_LIMIT', status: 429 };
        if (!response.ok) throw { type: 'HTTP_ERROR', status: response.status };
        return await response.json();
      } catch (err) {
        clearTimeout(timeoutId);
        if (err instanceof Error && err.name === 'AbortError') return;
        throw err;
      }
    });

    try {
      const data = await Promise.any(fetchPromises);
      if (!data?.elements) throw new Error('Neplatná data');
      
      churchCache.set(`${latitude.toFixed(4)},${longitude.toFixed(4)}`, {
        elements: data.elements,
        timestamp: Date.now()
      });
      
      return processElements(data.elements, latitude, longitude, t.nearbyChurch);
    } catch (err) {
      const error = err as { type?: string; status?: number };
      if (error.type === 'RATE_LIMIT' || error.status === 429) {
        throw { type: 'RATE_LIMIT' };
      }
      throw new Error('Servers unavailable');
    }
  };

  const handleFindNearby = () => {
    if (cooldown) {
      setError(t.cooldownMessage);
      return;
    }
    
    setCooldown(true);
    setLoading(true);
    setError(null);
    setNotFound(false);
    
    if (!navigator.geolocation) {
      setError("Geolocation not supported");
      setLoading(false);
      setCooldown(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const newLocationKey = `${latitude.toFixed(4)},${longitude.toFixed(4)}`;
        
        if (lastLocationKey && lastLocationKey !== newLocationKey) {
          setNearbyChurches([]);
          setNotFound(false);
        }
        
        setLastLocationKey(newLocationKey);
        setUserLocation({ lat: latitude, lng: longitude });

        const cached = churchCache.get(newLocationKey);
        if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
          const churches = processElements(cached.elements, latitude, longitude, t.nearbyChurch);
          setNearbyChurches(churches);
          setNotFound(churches.length === 0);
          setLoading(false);
          setCooldown(false);
          return;
        }

        try {
          const churches = await fetchChurches(latitude, longitude);
          setNearbyChurches(churches);
          setNotFound(churches.length === 0);
        } catch (err) {
          if (err && typeof err === 'object' && 'type' in err && err.type === 'RATE_LIMIT') {
            setCooldown(true);
            setTimeout(() => setCooldown(false), 30000);
            setError(t.error + ' (Příliš mnoho dotazů)');
          } else {
            setError(t.error + ' (Servery nedostupné)');
          }
        } finally {
          setLoading(false);
          setCooldown(false);
        }
      },
      () => {
        setError("Nepodařilo se získat polohu");
        setLoading(false);
        setCooldown(false);
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 60000 }
    );
  };

  const clearCacheForLocation = (lat: number, lng: number) => {
    const key = `${lat.toFixed(4)},${lng.toFixed(4)}`;
    churchCache.delete(key);
    console.log('🗑️ Cache vymazána pro', key);
  };

  return {
    userLocation,
    nearbyChurches,
    loading,
    error,
    cooldown,
    notFound,
    handleFindNearby,
    clearCacheForLocation
  };
};
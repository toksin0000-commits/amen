// app/[lang]/churches/church.utils.ts
import { OsmElement, Church, ChurchWithDistance, Lang } from './church.types';

export const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng/2) * Math.sin(dLng/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

export const processElements = (
  elements: OsmElement[], 
  latitude: number, 
  longitude: number,
  nearbyChurch: string
) => {
  return elements
    .filter((el: OsmElement) => el.tags?.name)
    .map((el: OsmElement) => ({
      name: el.tags?.name || "",
      address: el.tags?.["addr:city"] || 
               el.tags?.["addr:town"] || 
               el.tags?.["addr:village"] || 
               nearbyChurch,
      lat: el.lat || el.center?.lat || 0,
      lng: el.lon || el.center?.lon || 0,
      denomination: el.tags?.denomination || ""
    }))
    .filter((church: Church) => church.lat && church.lng)
    .map((church: Church) => ({
      ...church,
      distance: calculateDistance(latitude, longitude, church.lat, church.lng)
    }))
    .filter((church: ChurchWithDistance) => church.distance <= 5)
    .sort((a: ChurchWithDistance, b: ChurchWithDistance) => a.distance - b.distance)
    .slice(0, 10);
};
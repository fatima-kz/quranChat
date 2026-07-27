// Coordinates of the Kaaba in Mecca
export const KAABA_LAT = 21.422487;
export const KAABA_LNG = 39.826206;

/**
 * Calculates the exact bearing (Qiblah) from a given latitude/longitude to the Kaaba.
 * @param latitude User's current latitude
 * @param longitude User's current longitude
 * @returns The bearing in degrees (0 to 360) where 0 is true North.
 */
export function calculateQiblahBearing(latitude: number, longitude: number): number {
  const lat1 = (latitude * Math.PI) / 180;
  const lon1 = (longitude * Math.PI) / 180;
  const lat2 = (KAABA_LAT * Math.PI) / 180;
  const lon2 = (KAABA_LNG * Math.PI) / 180;

  const dLon = lon2 - lon1;

  const y = Math.sin(dLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLon);

  let bearing = (Math.atan2(y, x) * 180) / Math.PI;

  // Normalize to 0-360
  if (bearing < 0) {
    bearing += 360;
  }

  return bearing;
}

/**
 * Calculates the great-circle distance between a given point and the Kaaba using the Haversine formula.
 * @param latitude User's current latitude
 * @param longitude User's current longitude
 * @returns Distance in kilometers
 */
export function calculateDistanceToMecca(latitude: number, longitude: number): number {
  const R = 6371; // Earth radius in km

  const dLat = ((KAABA_LAT - latitude) * Math.PI) / 180;
  const dLon = ((KAABA_LNG - longitude) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((latitude * Math.PI) / 180) *
      Math.cos((KAABA_LAT * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return Math.round(R * c);
}

export interface PublicContactInfo {
  officeName: string;
  companyName: string;
  address: string;
  area: string;
  city: string;
  postalCode: string;
  country: string;
  phone: string;
  email: string;
  website: string;
  mapEmbedUrl: string;
  latitude: string;
  longitude: string;
  hoursWeekday: string;
}

export const OFFICE_COORDINATES = {
  latitude: 23.7539734,
  longitude: 90.3438245,
} as const;

export function normalizeContactInfo(value: Record<string, unknown>): PublicContactInfo {
  return {
    officeName: String(value.officeName || 'Corporate Office'),
    companyName: String(value.companyName || 'Geospatial Works'),
    address: String(value.address || ''),
    area: String(value.area || ''),
    city: String(value.city || ''),
    postalCode: String(value.postalCode || ''),
    country: String(value.country || ''),
    phone: String(value.phone || ''),
    email: String(value.email || ''),
    website: String(value.website || ''),
    mapEmbedUrl: String(value.mapEmbedUrl || ''),
    latitude: String(value.latitude || ''),
    longitude: String(value.longitude || ''),
    hoursWeekday: String(value.hoursWeekday || ''),
  };
}

export function contactAddress(info: PublicContactInfo): string {
  return [info.address, info.area, info.city, info.postalCode, info.country]
    .filter(Boolean)
    .join(', ');
}

export function phoneHref(phone: string): string {
  return `tel:${phone.replace(/[^\d+]/g, '')}`;
}

export function mapsSearchUrl(address: string): string {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
}

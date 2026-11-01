export type AttendanceWorkLocation = 'office' | 'home' | 'home_office' | 'field' | 'unknown';

export function hasValidCoordinates(latitude: unknown, longitude: unknown): boolean {
  const lat = Number(latitude);
  const lng = Number(longitude);
  return latitude !== null && latitude !== undefined && longitude !== null && longitude !== undefined &&
    Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180 &&
    (lat !== 0 || lng !== 0);
}

const normalizeLocation = (value: unknown): AttendanceWorkLocation | null => {
  const mode = String(value ?? '').trim().toLowerCase().replace(/[\s-]+/g, '_');
  if (['office', 'on_site', 'onsite', 'in_office'].includes(mode)) return 'office';
  if (['home', 'work_from_home', 'wfh', 'remote'].includes(mode)) return 'home';
  if (['home_office', 'homeoffice'].includes(mode)) return 'home_office';
  if (['field', 'field_duty', 'on_field', 'site'].includes(mode)) return 'field';
  return null;
};

export function getWorkLocation(record: Record<string, unknown>): AttendanceWorkLocation {
  const explicit = normalizeLocation(record.workMode ?? record.work_mode ?? record.workLocation ?? record.work_location);
  if (explicit) return explicit;

  const notes = String(record.notes ?? '').toLowerCase();
  if (/\b(?:work\s*mode\s*:\s*)?(?:home\s*office|homeoffice)\b|\[home office\]|home office:/.test(notes)) return 'home_office';
  if (/\[work mode:\s*home\]|\bwork from home\b|\bwfh\b/.test(notes)) return 'home';
  if (/\[work mode:\s*field\]|\[field duty\]|\bfield\s*:|\bon field\b/.test(notes)) return 'field';
  if (/\[work mode:\s*office\]/.test(notes)) return 'office';
  if (record.isInsideGeofence === true) return 'office';
  return 'unknown';
}

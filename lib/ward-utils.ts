import wardCentersData from '@/data/ward-centers.json';

export interface WardCenter {
  wardId: string;
  lat: number;
  lng: number;
}

const WARD_CENTERS: WardCenter[] = wardCentersData as WardCenter[];

/**
 * Get all ward centers with their coordinates
 */
export function getAllWardCenters(): WardCenter[] {
  return WARD_CENTERS;
}

/**
 * Get a specific ward's center coordinates
 */
export function getWardCenter(wardId: string): WardCenter | undefined {
  return WARD_CENTERS.find((ward: WardCenter) => ward.wardId === wardId);
}

/**
 * Get ward center by numeric ID
 */
export function getWardCenterByNumber(wardNumber: number): WardCenter | undefined {
  return getWardCenter(wardNumber.toString());
}

/**
 * Get all ward IDs
 */
export function getAllWardIds(): string[] {
  return WARD_CENTERS.map((ward: WardCenter) => ward.wardId);
}

/**
 * Check if a ward exists
 */
export function wardExists(wardId: string): boolean {
  return WARD_CENTERS.some((ward: WardCenter) => ward.wardId === wardId);
}
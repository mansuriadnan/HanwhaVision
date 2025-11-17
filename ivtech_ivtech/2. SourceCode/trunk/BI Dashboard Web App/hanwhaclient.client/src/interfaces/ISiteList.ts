export interface ISiteList {
  id?: string;
  siteName: string;
  siteAddress: string;
  contactNumber: string | "";
  contactPerson: string | null;
  country: string | null;
  state: string | null;
  city: string | null;
  contactEmail: string | null;
  geoLocation: GeoLocation;
}

export interface GeoLocation {
  latitude?: number | null;
  longitude?: number | null;
}

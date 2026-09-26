export interface Address {
  _id: string;
  label?: string;
  line1: string;
  line2?: string;
  city: string;
  region?: string;
  postalCode?: string;
  country: string;
  phone?: string;
  isDefault?: boolean;
}
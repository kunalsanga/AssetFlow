export interface Asset {
  id: number;
  name: string;
  serial_number: string;
  model: string;
  status: string;
  description?: string;
  is_shared?: boolean;
  asset_tag?: string;
  location?: string;
}


export function generatePaymentRef(): string {
  return `NEXA-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;
}

export const QRIS_IMAGE_URL = 'https://files.useyapi.com/projects/jYaWDB-0iSo0DPGsRZWnO/uploads/3700d558-a221-4713-94af-c63b76920d11-1001931285.jpg';

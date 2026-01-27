
export function verifyAdminKey(key: string): boolean {
  return key === process.env.KEY_ADMIN;
}

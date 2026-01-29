/** Super-admin UID: always has admin access regardless of Firestore profile. */
export const SUPER_ADMIN_UID =
  (typeof process !== 'undefined' && process.env.NEXT_PUBLIC_SUPER_ADMIN_UID) ||
  '6njOuKAigqXj1EJe2qGfwvBkm692';

export function isSuperAdmin(uid: string | undefined | null): boolean {
  return !!uid && uid === SUPER_ADMIN_UID;
}

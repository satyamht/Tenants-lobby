export const PRIVATE_LOCATION_HEADERS = {
  "Cache-Control": "private, no-store, max-age=0",
  "X-Content-Type-Options": "nosniff",
  "Referrer-Policy": "no-referrer",
} as const;

export function publicPropertyShape<T extends {
  id: string;
  title: string;
  city: string;
  locality: string;
}>(property: T) {
  const { id, title, city, locality } = property;
  return { id, title, city, locality };
}

/** Fix Django absolute media URLs that sometimes come back as localhost. */
export function mediaUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  try {
    const u = new URL(url, "https://scentraryv.pk");
    if (
      u.hostname === "localhost" ||
      u.hostname === "127.0.0.1" ||
      u.hostname.startsWith("172.")
    ) {
      return `https://scentraryv.pk${u.pathname}${u.search}`;
    }
    return u.toString();
  } catch {
    if (url.startsWith("/")) return `https://scentraryv.pk${url}`;
    return url;
  }
}

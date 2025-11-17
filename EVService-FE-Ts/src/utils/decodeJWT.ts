// Helper: decode JWT payload
export function parseJwt(token: string | null): any {
  if (!token) return null;
  const base64Url = token.split(".")[1];
  if (!base64Url) return null;
  try {
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

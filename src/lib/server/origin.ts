function parseOrigin(value: string | null | undefined): string | null {
  if (!value) return null;
  try {
    return new URL(value).origin;
  } catch {
    return null;
  }
}

export function isAllowedRequestOrigin(request: Request): boolean {
  const requestOrigin = request.headers.get("origin");
  if (!requestOrigin) return true;

  const origin = parseOrigin(requestOrigin);
  if (!origin) return false;

  const requestUrlOrigin = parseOrigin(request.url);
  const appUrlOrigin = parseOrigin(process.env["APP_URL"]);
  return origin === requestUrlOrigin || origin === appUrlOrigin;
}
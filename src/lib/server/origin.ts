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
  const forwardedHost = request.headers.get("x-forwarded-host")?.split(",").at(-1)?.trim();
  const host = forwardedHost || request.headers.get("host");
  const forwardedProtocol = request.headers
    .get("x-forwarded-proto")
    ?.split(",")
    .at(-1)
    ?.trim();
  const requestProtocol = new URL(request.url).protocol.slice(0, -1);
  const protocol =
    forwardedProtocol === "http" || forwardedProtocol === "https"
      ? forwardedProtocol
      : requestProtocol;
  const proxyOrigin = host ? parseOrigin(`${protocol}://${host}`) : null;

  return [requestUrlOrigin, appUrlOrigin, proxyOrigin].includes(origin);
}
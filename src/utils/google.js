import crypto from 'crypto';

export function randomId(len = 8) {
  return crypto.randomBytes(16).toString("hex").slice(0, len);
}

export async function gapi(url, method = "GET", accessToken, body, headers = {}) {
  const res = await fetch(url, {
    method,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${res.status} ${res.statusText} → ${url}\n${text}`);
  }
  return await res.json();
}

export async function exchangeCodeForTokens(code) {
  const params = new URLSearchParams({
    code,
    client_id: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET,
    redirect_uri: `${import.meta.env.VITE_APP_URL}/provision/callback`,
    grant_type: "authorization_code",
  });

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: params,
    cache: "no-store",
  });
  const json = await res.json();
  if (!res.ok) throw new Error(JSON.stringify(json));
  return json;
}

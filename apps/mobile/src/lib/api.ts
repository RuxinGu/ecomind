import { Platform } from 'react-native';
import Constants from 'expo-constants';

const defaultBaseUrl =
  Platform.OS === 'android' ? 'http://10.0.2.2:4000' : 'http://localhost:4000';
const defaultProdBaseUrls = ['https://ecomind-2.onrender.com', 'https://ecomind-api.onrender.com'];

function resolveExpoHostBaseUrl() {
  const expoHostUri =
    (Constants.expoConfig as { hostUri?: string } | null)?.hostUri ||
    (Constants as unknown as { manifest2?: { extra?: { expoGo?: { debuggerHost?: string } } } }).manifest2?.extra
      ?.expoGo?.debuggerHost ||
    (Constants as unknown as { manifest?: { debuggerHost?: string } }).manifest?.debuggerHost;

  if (!expoHostUri) return null;
  const host = expoHostUri.split(':')[0];
  if (!host) return null;
  return `http://${host}:4000`;
}

function normalizeBase(value: string | null | undefined) {
  const v = String(value || '').trim();
  if (!v) return null;
  return v.replace(/\/+$/, '');
}

function isPrivateOrLocalUrl(value: string) {
  try {
    const u = new URL(value);
    const host = (u.hostname || '').toLowerCase();
    if (host === 'localhost' || host === '127.0.0.1') return true;
    if (host.startsWith('10.')) return true;
    if (host.startsWith('192.168.')) return true;
    if (/^172\.(1[6-9]|2\d|3[0-1])\./.test(host)) return true;
    return false;
  } catch {
    return true;
  }
}

function getCandidateBaseUrls() {
  const production = !__DEV__;
  const candidates: string[] = [];
  const envUrl = normalizeBase(process.env.EXPO_PUBLIC_API_URL);
  const prodFallbacks = defaultProdBaseUrls.map((url) => normalizeBase(url)).filter(Boolean) as string[];

  if (production) {
    for (const candidate of [envUrl, ...prodFallbacks]) {
      if (!candidate) continue;
      if (!candidate.startsWith('https://')) continue;
      if (isPrivateOrLocalUrl(candidate)) continue;
      if (!candidates.includes(candidate)) candidates.push(candidate);
    }
    return candidates;
  }

  const expoUrl = normalizeBase(resolveExpoHostBaseUrl());
  const localhost = normalizeBase('http://localhost:4000');
  const loopback = normalizeBase('http://127.0.0.1:4000');
  const androidEmulator = normalizeBase('http://10.0.2.2:4000');
  const fallback = normalizeBase(defaultBaseUrl);

  for (const candidate of [envUrl, expoUrl, fallback, localhost, loopback, androidEmulator]) {
    if (candidate && !candidates.includes(candidate)) {
      candidates.push(candidate);
    }
  }
  return candidates;
}

const API_URL = getCandidateBaseUrls()[0] || defaultBaseUrl;

function withTimeout(ms: number) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), ms);
  return {
    signal: controller.signal,
    clear: () => clearTimeout(timer)
  };
}

export async function apiRequest<T>(
  path: string,
  options: RequestInit = {},
  token?: string
): Promise<T> {
  const candidates = getCandidateBaseUrls();
  let response: Response | null = null;
  const attemptsPerBase = __DEV__ ? 1 : 3;
  const timeoutMs = __DEV__ ? 9000 : 35000;

  for (const baseUrl of candidates) {
    for (let attempt = 1; attempt <= attemptsPerBase; attempt += 1) {
      const timeout = withTimeout(timeoutMs);
      try {
        response = await fetch(`${baseUrl}${path}`, {
          ...options,
          signal: timeout.signal,
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
            ...(options.headers || {})
          }
        });
        timeout.clear();
        break;
      } catch (_e) {
        timeout.clear();
        if (attempt < attemptsPerBase) {
          await new Promise((resolve) => setTimeout(resolve, 1200));
        }
      }
    }
    if (response) {
      break;
    }
  }

  if (!response) {
    if (!__DEV__) {
      throw new Error('Service temporarily unavailable. Please try again in a moment.');
    }
    throw new Error(
      `Network request failed. Tried: ${candidates.join(', ')}. Ensure backend is running and reachable on your LAN.`
    );
  }

  if (!response.ok) {
    let error = 'Request failed';
    try {
      const body = await response.json();
      error = body.error || error;
    } catch (_e) {
      // Keep generic fallback when server does not return JSON.
    }
    throw new Error(error);
  }

  return response.json() as Promise<T>;
}

export { API_URL };

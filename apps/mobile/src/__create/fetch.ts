import { secureGetItem } from '../utils/auth/secureStorage';
import { fetch as expoFetch } from 'expo/fetch';
import {
  BASE_URL as CONFIG_BASE_URL,
  PROXY_BASE_URL as CONFIG_PROXY_BASE_URL,
  HOST as CONFIG_HOST,
  PROJECT_GROUP_ID as CONFIG_PROJECT_GROUP_ID,
} from '../config';

const originalFetch = fetch;
const authKey = `${CONFIG_PROJECT_GROUP_ID}-jwt`;

const getURLFromArgs = (...args: Parameters<typeof fetch>) => {
  const [urlArg] = args;
  let url: string | null;
  if (typeof urlArg === 'string') {
    url = urlArg;
  } else if (typeof urlArg === 'object' && urlArg !== null) {
    // @ts-ignore
    url = urlArg.url;
  } else {
    url = null;
  }
  return url;
};

const isFirstPartyURL = (url: string) => {
  return (
    url.startsWith('/') ||
    (CONFIG_BASE_URL && url.startsWith(CONFIG_BASE_URL)) ||
    (CONFIG_PROXY_BASE_URL && url.startsWith(CONFIG_PROXY_BASE_URL))
  );
};

const isSecondPartyURL = (url: string) => {
  return url.startsWith('/_create/');
};

type Params = Parameters<typeof expoFetch>;
const fetchToWeb = async function fetchWithHeaders(...args: Params) {
  const [input, init] = args;
  const url = getURLFromArgs(input as any, init as any);
  if (!url) {
    return expoFetch(input, init);
  }

  const isExternalFetch = !isFirstPartyURL(url);
  // we should not add headers to requests that don't go to our own server
  if (isExternalFetch) {
    return expoFetch(input, init);
  }

  let finalInput = input;
  const baseURL =
    isSecondPartyURL(url) && CONFIG_PROXY_BASE_URL ? CONFIG_PROXY_BASE_URL : CONFIG_BASE_URL;

  if (typeof input === 'string') {
    if (input.startsWith('/') && baseURL) {
      finalInput = `${baseURL}${input}`;
    }
  } else {
    // non-string Request objects: fallback to original fetch, avoid mutating
    // @ts-ignore
    return originalFetch(input, init);
  }

  const initHeaders = init?.headers ?? {};
  const finalHeaders = new Headers(initHeaders as any);

  const headers: Record<string, string | undefined> = {
    'x-createxyz-project-group-id': CONFIG_PROJECT_GROUP_ID,
    host: CONFIG_HOST,
    'x-forwarded-host': CONFIG_HOST,
    'x-createxyz-host': CONFIG_HOST,
  };

  for (const [key, value] of Object.entries(headers)) {
    if (value) {
      finalHeaders.set(key, value);
    }
  }

  const auth = await secureGetItem(authKey)
    .then((auth) => {
      return auth ? JSON.parse(auth) : null;
    })
    .catch(() => {
      return null;
    });

  if (auth) {
    finalHeaders.set('authorization', `Bearer ${auth.jwt}`);
  }

  return expoFetch(finalInput as any, {
    ...init,
    headers: finalHeaders,
  });
};

export default fetchToWeb;

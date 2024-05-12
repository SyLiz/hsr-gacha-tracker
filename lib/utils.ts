import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const fetcher = (url: string) =>
  fetch(url).then(async (response) => {
    if (!response.ok) {
      throw new Error(response.statusText, { cause: await response.json() });
    }
    return response.json();
  });

export function objectToUrlParams(obj: any): string {
  return Object.keys(obj)
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(obj[key])}`)
    .join("&");
}

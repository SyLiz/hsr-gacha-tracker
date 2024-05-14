import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Log } from "@/models/GachaLog";
import React from "react";

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

export function sortById(list: Log[]) {
  return list.sort((a, b) => b.id.localeCompare(a.id));
}

export function getArrNotDuplicates(
  arr: Log[],
  checkMap: any,
  onEnd: () => void
): Log[] {
  if (!checkMap) return arr;
  var tempArr: Log[] = [];
  for (let item of arr) {
    if (item.id in checkMap) {
      onEnd();
      break;
    }
    tempArr.push(item);
  }
  return tempArr;
}

export const createMapById = (arr: Log[]): Record<string, Log> => {
  return arr.reduce((map, obj) => {
    map[obj.id] = obj;
    return map;
  }, {} as Record<string, Log>);
};

export function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function removeItem<T>(arr: Array<T>, value: T): Array<T> {
  const index = arr.indexOf(value);
  if (index > -1) {
    arr.splice(index, 1);
  }
  return arr;
}

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function prettyAddress(address: string) {
  if (address.includes(".eth")) {
    return address;
  }

  return address.slice(0, 6);
}

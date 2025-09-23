import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function shortenAddress(address: string, chars = 4): string {
  if (!address) return '';
  const parsed = address;
  if (parsed.length < chars * 2 + 3) {
    return parsed;
  }
  return `${parsed.substring(0, chars + 2)}...${parsed.substring(
    parsed.length - chars
  )}`;
}

import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function getShortLink(partial) {
  const domain = import.meta.env.VITE_PUBLIC_SHORT_DOMAIN || 'https://short.in';
  if (!partial) return domain;
  const code = partial.custom_url || partial.short_url || String(partial);
  return `${domain}/${code}`;
}

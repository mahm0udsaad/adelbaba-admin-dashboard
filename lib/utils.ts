import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format date using Gregorian calendar with Arabic locale for text but English numerals
 * This ensures dates are never displayed in Hijri calendar
 */
export function formatDateGregorian(
  dateString?: string | null,
  options?: Intl.DateTimeFormatOptions
): string {
  if (!dateString) return "غير متوفر"

  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return dateString

    return new Intl.DateTimeFormat("ar-EG", {
      calendar: "gregory", // Force Gregorian calendar
      numberingSystem: "latn", // Force Latin numerals (English numbers)
      dateStyle: "medium",
      timeStyle: "short",
      ...options,
    }).format(date)
  } catch {
    return dateString
  }
}

/**
 * Format date for short display (date only)
 */
export function formatDateShort(dateString?: string | null): string {
  return formatDateGregorian(dateString, {
    dateStyle: "short",
    timeStyle: undefined,
  })
}

/**
 * Format number with English numerals regardless of locale
 */
export function formatNumberEnglish(
  value: number | string | null | undefined,
  options?: Intl.NumberFormatOptions
): string {
  if (value === null || value === undefined || value === "") return "-"

  const num = typeof value === "number" ? value : Number(value)
  if (isNaN(num)) return String(value)

  return new Intl.NumberFormat("en-US", {
    numberingSystem: "latn", // Force Latin numerals
    ...options,
  }).format(num)
}

/**
 * Format price with English numerals and proper currency formatting
 */
export function formatPriceEnglish(
  price?: number | null | string,
  currency: string = "SAR"
): string {
  if (price === null || price === undefined || price === "") return "-"

  const num = typeof price === "number" ? price : Number(price)
  if (isNaN(num)) return String(price)

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    numberingSystem: "latn", // Force English numerals
  }).format(num)
}

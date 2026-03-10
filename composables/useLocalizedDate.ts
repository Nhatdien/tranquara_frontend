/**
 * useLocalizedDate Composable
 *
 * Provides locale-aware date formatting functions.
 * Automatically uses the current i18n locale to determine the date format locale.
 *
 * Usage:
 *   const { formatDate, formatTime, formatDateTime, formatRelative, dateLocale } = useLocalizedDate();
 *   const formatted = formatDate('2024-01-15');  // "January 15, 2024" or "15 tháng 1, 2024"
 */

const LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  vi: 'vi-VN',
};

export function useLocalizedDate() {
  const { locale } = useI18n();

  /** The BCP 47 locale string used for Intl date formatting */
  const dateLocale = computed(() => LOCALE_MAP[locale.value] || 'en-US');

  /**
   * Format a date string with customizable options.
   * Defaults to: "January 15, 2024" / "15 tháng 1, 2024"
   */
  function formatDate(
    dateInput: string | Date,
    options?: Intl.DateTimeFormatOptions
  ): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    };
    return date.toLocaleDateString(dateLocale.value, options || defaultOptions);
  }

  /**
   * Format time only.
   * Defaults to: "3:30 PM" / "15:30"
   */
  function formatTime(
    dateInput: string | Date,
    options?: Intl.DateTimeFormatOptions
  ): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const defaultOptions: Intl.DateTimeFormatOptions = {
      hour: 'numeric',
      minute: '2-digit',
      hour12: locale.value === 'en',
    };
    return date.toLocaleTimeString(dateLocale.value, options || defaultOptions);
  }

  /**
   * Format full date and time.
   * Defaults to: "January 15, 2024, 3:30 PM" / "15 tháng 1, 2024, 15:30"
   */
  function formatDateTime(
    dateInput: string | Date,
    options?: Intl.DateTimeFormatOptions
  ): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: locale.value === 'en',
    };
    return date.toLocaleString(dateLocale.value, options || defaultOptions);
  }

  /**
   * Format date as short form.
   * Output: "Jan 15" / "15 Thg 1"
   */
  function formatDateShort(dateInput: string | Date): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    return date.toLocaleDateString(dateLocale.value, {
      month: 'short',
      day: 'numeric',
    });
  }

  /**
   * Format date for history grouping headers.
   * Output: "WEDNESDAY, 28.01" / "THỨ TƯ, 28.01"
   */
  function formatDateGroupHeader(dateInput: string | Date): string {
    const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
    const dayName = date.toLocaleDateString(dateLocale.value, { weekday: 'long' }).toUpperCase();
    const dayMonth = date.toLocaleDateString(dateLocale.value, { day: '2-digit', month: '2-digit' }).replace('/', '.');
    return `${dayName}, ${dayMonth}`;
  }

  return {
    dateLocale,
    formatDate,
    formatTime,
    formatDateTime,
    formatDateShort,
    formatDateGroupHeader,
  };
}

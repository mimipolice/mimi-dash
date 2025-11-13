/**
 * Discord timestamp 格式轉換工具
 * 支援格式：<t:1234567890:F>
 * 
 * 格式類型：
 * - t: 短時間 (16:20)
 * - T: 長時間 (16:20:30)
 * - d: 短日期 (20/04/2021)
 * - D: 長日期 (20 April 2021)
 * - f: 短日期時間 (20 April 2021 16:20)
 * - F: 長日期時間 (Tuesday, 20 April 2021 16:20)
 * - R: 相對時間 (2 months ago)
 */

const DISCORD_TIMESTAMP_REGEX = /<t:(\d+)(?::([tTdDfFR]))?>/g;

const formatOptions: Record<string, Intl.DateTimeFormatOptions> = {
  t: { hour: "2-digit", minute: "2-digit" },
  T: { hour: "2-digit", minute: "2-digit", second: "2-digit" },
  d: { day: "2-digit", month: "2-digit", year: "numeric" },
  D: { day: "numeric", month: "long", year: "numeric" },
  f: {
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
  F: {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  },
};

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp * 1000;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const months = Math.floor(days / 30);
  const years = Math.floor(days / 365);

  if (years > 0) return `${years} year${years > 1 ? "s" : ""} ago`;
  if (months > 0) return `${months} month${months > 1 ? "s" : ""} ago`;
  if (days > 0) return `${days} day${days > 1 ? "s" : ""} ago`;
  if (hours > 0) return `${hours} hour${hours > 1 ? "s" : ""} ago`;
  if (minutes > 0) return `${minutes} minute${minutes > 1 ? "s" : ""} ago`;
  return "just now";
}

export function parseDiscordTimestamp(text: string): string {
  return text.replace(
    DISCORD_TIMESTAMP_REGEX,
    (match, timestamp, format = "f") => {
      const date = new Date(parseInt(timestamp) * 1000);

      if (format === "R") {
        return formatRelativeTime(parseInt(timestamp));
      }

      const options = formatOptions[format] || formatOptions.f;
      return date.toLocaleString("en-US", options);
    }
  );
}

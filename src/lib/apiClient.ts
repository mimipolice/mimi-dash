export interface Announcement {
  id: number;
  title: string;
  content: string;
  severity: "info" | "warning" | "alert";
  image_url: string | null;
  author_name: string | null;
  author_avatar_url: string | null;
  published_at: string; // ISO 8601 datetime string
  view_count: number;
  created_at: string; // ISO 8601 datetime string
  updated_at: string; // ISO 8601 datetime string
}

export interface Banner {
  id: string; // UUID
  title: string;
  short_description: string | null;
  url: string | null;
  severity: "info" | "warning" | "alert";
  display_from: string | null; // ISO 8601 datetime string
  display_until: string | null; // ISO 8601 datetime string
  created_at: string; // ISO 8601 datetime string
  updated_at: string; // ISO 8601 datetime string
}

import { handleApiResponse } from "./apiHelper";

const apiClient = {
  getAnnouncements: async (): Promise<Announcement[]> => {
    const response = await fetch("/api/announcements");
    return (await handleApiResponse(response)) ?? [];
  },
  recordAnnouncementView: async (
    id: number
  ): Promise<{ view_count: number }> => {
    const response = await fetch(`/api/announcements/${id}/view`, {
      method: "POST",
    });
    return await handleApiResponse(response);
  },
  getActiveBanners: async (): Promise<Banner[]> => {
    const response = await fetch("/api/banners/active");
    return (await handleApiResponse(response)) ?? [];
  },
};

export default apiClient;

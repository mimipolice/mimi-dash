import { Announcement } from "@/lib/apiClient";

export type AnnouncementInput = Omit<Announcement, "id" | "author">;

import { handleApiResponse } from "../apiHelper";

export async function fetchAnnouncements(): Promise<Announcement[]> {
  const response = await fetch("/api/admin/announcements");
  return (await handleApiResponse(response)) ?? [];
}

export async function createAnnouncement(
  announcement: AnnouncementInput
): Promise<Announcement> {
  const response = await fetch("/api/admin/announcements", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(announcement),
  });
  return handleApiResponse(response);
}

export async function updateAnnouncement(
  id: string,
  announcement: Partial<AnnouncementInput>
): Promise<Announcement> {
  const response = await fetch(`/api/admin/announcements/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(announcement),
  });
  return handleApiResponse(response);
}

export async function deleteAnnouncement(
  id: string
): Promise<{ message: string }> {
  const response = await fetch(`/api/admin/announcements/${id}`, {
    method: "DELETE",
  });
  return handleApiResponse(response);
}

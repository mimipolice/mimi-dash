import { Banner } from "@/lib/apiClient";

import { handleApiResponse } from "../apiHelper";

export async function fetchBanners(): Promise<Banner[]> {
  const response = await fetch("/api/admin/banners");
  // 後端已統一格式，現在 handleApiResponse 會處理
  return (await handleApiResponse(response)) ?? [];
}

export async function createBanner(data: Partial<Banner>): Promise<Banner> {
  const response = await fetch("/api/admin/banners", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleApiResponse(response);
}

export async function updateBanner(
  id: string,
  data: Partial<Banner>
): Promise<Banner> {
  const response = await fetch(`/api/admin/banners/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return handleApiResponse(response);
}

export async function deleteBanner(id: string): Promise<{ message: string }> {
  const response = await fetch(`/api/admin/banners/${id}`, {
    method: "DELETE",
  });
  return handleApiResponse(response);
}

export async function fetchActiveBanners(): Promise<Banner[]> {
  const response = await fetch("/api/banners/active");
  // 現在後端也應該回傳統一格式
  return (await handleApiResponse(response)) ?? [];
}

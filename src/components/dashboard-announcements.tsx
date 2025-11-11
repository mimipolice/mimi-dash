"use client";

import { useState, useEffect, useCallback } from "react";
import { AnnouncementBanner } from "@/components/announcement-banner";
import apiClient, { Banner } from "@/lib/apiClient";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

export function DashboardAnnouncements() {
  const [banners, setBanners] = useState<Banner[]>([]);

  const getBanners = useCallback(async () => {
    try {
      const data = await apiClient.getActiveBanners();
      setBanners(data || []);
    } catch (error) {
      console.error("Failed to fetch banners for banner:", error);
    }
  }, []);

  // 初始加載
  useEffect(() => {
    getBanners();
  }, [getBanners]);

  // 自動刷新（每 30 秒）
  useAutoRefresh({
    interval: 30000,
    enabled: true,
    onRefresh: getBanners,
  });

  return <AnnouncementBanner announcements={banners} />;
}

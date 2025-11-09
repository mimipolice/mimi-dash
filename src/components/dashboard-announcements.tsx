"use client";

import { useState, useEffect } from "react";
import { AnnouncementBanner } from "@/components/announcement-banner";
import apiClient, { Banner } from "@/lib/apiClient";

export function DashboardAnnouncements() {
  const [banners, setBanners] = useState<Banner[]>([]);

  useEffect(() => {
    async function getBanners() {
      try {
        const data = await apiClient.getActiveBanners();
        setBanners(data || []);
      } catch (error) {
        console.error("Failed to fetch banners for banner:", error);
      }
    }
    getBanners();
  }, []);

  return <AnnouncementBanner announcements={banners} />;
}

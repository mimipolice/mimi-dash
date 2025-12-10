"use client";

import { useEffect } from "react";
import { Announcement } from "@/lib/apiClient";

interface DynamicOGUpdaterProps {
  announcements: Announcement[];
}

export function DynamicOGUpdater({ announcements }: DynamicOGUpdaterProps) {
  useEffect(() => {
    const updateMetaTags = () => {
      // 檢查路徑 /announcements/123 或 hash #123
      const pathMatch = window.location.pathname.match(
        /\/announcements\/(\d+)/
      );
      const hash = window.location.hash.slice(1);
      const idStr = pathMatch ? pathMatch[1] : hash;

      if (idStr) {
        const id = parseInt(idStr);
        const announcement = announcements.find((a) => a.id === id);

        if (announcement) {
          const baseUrl = window.location.origin;
          const ogImageUrl = `${baseUrl}/api/og/announcement?id=${id}`;
          const description = announcement.content
            .replace(/[#*`\[\]]/g, "")
            .replace(/\n/g, " ")
            .substring(0, 160)
            .trim();

          // 更新 OG tags
          updateMetaTag("og:title", announcement.title);
          updateMetaTag("og:description", description);
          updateMetaTag("og:image", ogImageUrl);
          updateMetaTag("og:type", "article");
          updateMetaTag("og:url", window.location.href);

          // 更新 Twitter tags
          updateMetaTag("twitter:title", announcement.title);
          updateMetaTag("twitter:description", description);
          updateMetaTag("twitter:image", ogImageUrl);

          // 更新頁面標題
          document.title = `${announcement.title} | Mimidactyl`;
        }
      } else {
        // 恢復預設
        const baseUrl = window.location.origin;
        updateMetaTag("og:title", "公告 | Mimidactyl");
        updateMetaTag("og:description", "查看 Mimidactyl 的最新公告和更新資訊");
        updateMetaTag("og:image", `${baseUrl}/api/og/announcements`);
        updateMetaTag("og:type", "website");
        updateMetaTag("og:url", window.location.href);

        updateMetaTag("twitter:title", "公告 | Mimidactyl");
        updateMetaTag(
          "twitter:description",
          "查看 Mimidactyl 的最新公告和更新資訊"
        );
        updateMetaTag("twitter:image", `${baseUrl}/api/og/announcements`);

        document.title = "公告 | Mimidactyl";
      }
    };

    // 初始更新
    updateMetaTags();

    // 監聽 hash 和 popstate 變化
    window.addEventListener("hashchange", updateMetaTags);
    window.addEventListener("popstate", updateMetaTags);

    return () => {
      window.removeEventListener("hashchange", updateMetaTags);
      window.removeEventListener("popstate", updateMetaTags);
    };
  }, [announcements]);

  return null;
}

function updateMetaTag(property: string, content: string) {
  let element = document.querySelector(
    `meta[property="${property}"], meta[name="${property}"]`
  );

  if (!element) {
    element = document.createElement("meta");
    if (property.startsWith("og:")) {
      element.setAttribute("property", property);
    } else {
      element.setAttribute("name", property);
    }
    document.head.appendChild(element);
  }

  element.setAttribute("content", content);
}

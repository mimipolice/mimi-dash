import { Metadata } from "next";
import AnnouncementsPageClient from "../page-client";

// 強制動態渲染
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getAnnouncement(id: string) {
  const backendUrl = process.env.BACKEND_API_URL;
  const apiKey = process.env.BACKEND_API_KEY;

  if (!backendUrl || !apiKey) {
    console.error("[Metadata] Missing BACKEND_API_URL or BACKEND_API_KEY");
    return null;
  }

  try {
    console.log(
      `[Metadata] Fetching announcement ${id} from ${backendUrl}/api/announcements`
    );

    const response = await fetch(`${backendUrl}/api/announcements`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(
        `[Metadata] Failed to fetch announcements: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const data = await response.json();

    // 處理不同的響應格式
    let announcements: any[];
    if (Array.isArray(data)) {
      announcements = data;
    } else if (data.data && Array.isArray(data.data)) {
      announcements = data.data;
    } else if (data.announcements && Array.isArray(data.announcements)) {
      announcements = data.announcements;
    } else {
      console.error(
        `[Metadata] Unexpected response format:`,
        typeof data,
        Object.keys(data || {})
      );
      return null;
    }

    const announcement = announcements.find(
      (a: { id: number }) => a.id.toString() === id
    );

    if (announcement) {
      console.log(`[Metadata] Found announcement ${id}: ${announcement.title}`);
    } else {
      console.warn(
        `[Metadata] Announcement ${id} not found in list of ${announcements.length} items`
      );
    }

    return announcement;
  } catch (error) {
    console.error("[Metadata] Error fetching announcement:", error);
    return null;
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const ogImageUrl = `${baseUrl}/api/og/announcement?id=${id}`;

  try {
    const announcement = await getAnnouncement(id);

    if (!announcement) {
      console.warn(`[Metadata] Announcement ${id} not found, using fallback`);
      return {
        title: `公告 #${id} | Mimidactyl`,
        description: "查看 Mimidactyl 的公告詳情",
        openGraph: {
          title: `公告 #${id} | Mimidactyl`,
          description: "查看 Mimidactyl 的公告詳情",
          type: "article",
          images: [
            {
              url: ogImageUrl,
              width: 1200,
              height: 630,
              alt: `公告 #${id}`,
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title: `公告 #${id} | Mimidactyl`,
          description: "查看 Mimidactyl 的公告詳情",
          images: [ogImageUrl],
        },
      };
    }

    // Generate description from content (strip markdown, limit to 160 chars)
    const description = announcement.content
      .replace(/[#*`\[\]]/g, "")
      .replace(/\n/g, " ")
      .substring(0, 160)
      .trim();

    console.log(
      `[Metadata] Generated for announcement ${id}: ${announcement.title}`
    );

    return {
      title: `${announcement.title} | Mimidactyl`,
      description: description || announcement.title,
      openGraph: {
        title: announcement.title,
        description: description || announcement.title,
        type: "article",
        publishedTime: announcement.published_at,
        modifiedTime: announcement.updated_at,
        authors: announcement.author_name
          ? [announcement.author_name]
          : undefined,
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: announcement.title,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: announcement.title,
        description: description || announcement.title,
        images: [ogImageUrl],
      },
    };
  } catch (error) {
    console.error(
      `[Metadata] Error generating metadata for announcement ${id}:`,
      error
    );
    // 返回 fallback metadata
    return {
      title: `公告 #${id} | Mimidactyl`,
      description: "查看 Mimidactyl 的公告詳情",
      openGraph: {
        title: `公告 #${id} | Mimidactyl`,
        description: "查看 Mimidactyl 的公告詳情",
        type: "article",
        images: [
          {
            url: ogImageUrl,
            width: 1200,
            height: 630,
            alt: `公告 #${id}`,
          },
        ],
      },
      twitter: {
        card: "summary_large_image",
        title: `公告 #${id} | Mimidactyl`,
        description: "查看 Mimidactyl 的公告詳情",
        images: [ogImageUrl],
      },
    };
  }
}

export default function AnnouncementPage() {
  // 直接渲染公告列表頁面，客戶端會自動展開對應的公告
  return <AnnouncementsPageClient />;
}

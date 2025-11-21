import { Metadata } from "next";
import AnnouncementsPageClient from "../page-client";

async function getAnnouncement(id: string) {
  try {
    // 使用前端 API 路由，這樣可以在運行時訪問
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const response = await fetch(`${baseUrl}/api/announcements`, {
      cache: "no-store",
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      console.error(
        `Failed to fetch announcements: ${response.status} ${response.statusText}`
      );
      return null;
    }

    const announcements = await response.json();
    const announcement = announcements.find(
      (a: { id: number }) => a.id.toString() === id
    );

    if (announcement) {
      console.log(`[Metadata] Found announcement ${id}: ${announcement.title}`);
    } else {
      console.warn(`[Metadata] Announcement ${id} not found in list`);
    }

    return announcement;
  } catch (error) {
    console.error("Error fetching announcement:", error);
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

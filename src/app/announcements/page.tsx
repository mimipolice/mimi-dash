import { Metadata } from "next";
import AnnouncementsPageClient from "./page-client";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  return {
    title: "公告 | Mimidactyl",
    description: "查看 Mimidactyl 的最新公告和更新資訊",
    openGraph: {
      title: "公告 | Mimidactyl",
      description: "查看 Mimidactyl 的最新公告和更新資訊",
      type: "website",
      images: [
        {
          url: `${baseUrl}/api/og/announcements`,
          width: 1200,
          height: 630,
          alt: "Mimidactyl 公告",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "公告 | Mimidactyl",
      description: "查看 Mimidactyl 的最新公告和更新資訊",
    },
  };
}

export default function AnnouncementsPage() {
  return <AnnouncementsPageClient />;
}

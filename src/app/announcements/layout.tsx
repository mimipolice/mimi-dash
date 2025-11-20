import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  // 如果有特定公告 ID，生成動態 OG
  // 這會在客戶端通過 hash 處理，但我們可以提供一個通用的 OG

  return {
    title: "公告 | Lolidactyl",
    description: "查看 Lolidactyl 的最新公告和更新資訊",
    openGraph: {
      title: "公告 | Lolidactyl",
      description: "查看 Lolidactyl 的最新公告和更新資訊",
      type: "website",
      images: [
        {
          url: `${baseUrl}/api/og/announcements`,
          width: 1200,
          height: 630,
          alt: "Lolidactyl 公告",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "公告 | Lolidactyl",
      description: "查看 Lolidactyl 的最新公告和更新資訊",
    },
  };
}

export default function AnnouncementsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="mb-6 text-3xl font-bold">公告</h1>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

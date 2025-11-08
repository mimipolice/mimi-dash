import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";

// 模擬的公告資料
const announcements = [
  {
    id: 1,
    author: {
      name: "Amamiya",
      avatarUrl: "/images/amamiya.jpg",
    },
    content: (
      <>
        <p>我們很高興地宣布，MimiDLC 現已推出全新的儀表板介面！🎉</p>
        <p>
          這次更新我們專注於改善使用者體驗，並帶來了更強大的功能，希望能幫助您更有效率地管理您的服務。
        </p>
        <p>快來體驗看看吧！</p>
      </>
    ),
    imageUrl: "/images/bg/home.jpg",
    createdAt: "2025-11-08",
  },
  {
    id: 2,
    author: {
      name: "Mimi",
      avatarUrl: "/images/amamiya.webp",
    },
    content: (
      <p>
        為了慶祝新介面上線，我們將在本週末舉辦抽獎活動，詳情請見 Discord 群組！
      </p>
    ),
    createdAt: "2025-11-07",
  },
  {
    id: 3,
    author: {
      name: "Amamiya",
      avatarUrl: "/images/amamiya.jpg",
    },
    content: (
      <>
        <p>我們很高興地宣布，MimiDLC 現已推出全新的儀表板介面！🎉</p>
        <p>
          這次更新我們專注於改善使用者體驗，並帶來了更強大的功能，希望能幫助您更有效率地管理您的服務。
        </p>
        <p>快來體驗看看吧！</p>
      </>
    ),
    imageUrl: "/images/bg/home.jpg",
    createdAt: "2025-11-08",
  },
  {
    id: 4,
    author: {
      name: "Mimi",
      avatarUrl: "/images/amamiya.webp",
    },
    content: (
      <p>
        為了慶祝新介面上線，我們將在本週末舉辦抽獎活動，詳情請見 Discord 群組！
      </p>
    ),
    createdAt: "2025-11-07",
  },
  {
    id: 5,
    author: {
      name: "Amamiya",
      avatarUrl: "/images/amamiya.jpg",
    },
    content: (
      <>
        <p>我們很高興地宣布，MimiDLC 現已推出全新的儀表板介面！🎉</p>
        <p>
          這次更新我們專注於改善使用者體驗，並帶來了更強大的功能，希望能幫助您更有效率地管理您的服務。
        </p>
        <p>快來體驗看看吧！</p>
      </>
    ),
    imageUrl: null,
    createdAt: "2025-11-08",
  },
  {
    id: 6,
    author: {
      name: "Mimi",
      avatarUrl: "/images/amamiya.webp",
    },
    content: (
      <p>
        為了慶祝新介面上線，我們將在本週末舉辦抽獎活動，詳情請見 Discord 群組！
      </p>
    ),
    createdAt: "2025-11-07",
  },
];

export default function AnnouncementsPage() {
  return (
    <div className="container mx-auto max-w-2xl py-8">
      <h1 className="mb-6 text-3xl font-bold">公告</h1>
      <div className="space-y-6">
        {announcements.map((announcement) => (
          <Card key={announcement.id}>
            <CardHeader>
              <div className="flex items-center space-x-4">
                <Avatar>
                  <AvatarImage
                    src={announcement.author.avatarUrl}
                    alt={announcement.author.name}
                  />
                  <AvatarFallback>
                    {announcement.author.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{announcement.author.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {announcement.createdAt}
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="prose dark:prose-invert max-w-none">
                {announcement.content}
              </div>
              {announcement.imageUrl && (
                <div className="mt-4">
                  <Image
                    src={announcement.imageUrl}
                    alt={`Announcement ${announcement.id} image`}
                    width={600}
                    height={400}
                    className="rounded-lg"
                  />
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

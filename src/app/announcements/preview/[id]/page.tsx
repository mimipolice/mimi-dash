"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Announcement } from "@/lib/apiClient";
import { formatInTimeZone } from "date-fns-tz";
import { useTranslations } from "next-intl";
import { parseDiscordTimestamp } from "@/lib/discord-timestamp";
import { fetchAnnouncements } from "@/lib/api/announcements";

export default function AnnouncementPreviewPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("announcements");
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadAnnouncement = async () => {
      try {
        setLoading(true);
        const data = await fetchAnnouncements();
        const found = data.find((a) => a.id.toString() === params.id);

        if (found) {
          setAnnouncement(found);
        } else {
          setError("公告不存在");
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncement();
  }, [params.id]);

  if (loading) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <h1 className="mb-6 text-3xl font-bold">{t("title")}</h1>
        <p>{t("loading")}</p>
      </div>
    );
  }

  if (error || !announcement) {
    return (
      <div className="container mx-auto max-w-4xl py-8">
        <Button variant="ghost" onClick={() => router.back()} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <h1 className="mb-6 text-3xl font-bold">{t("title")}</h1>
        <p>Error: {error || "公告不存在"}</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl py-8">
      <Button variant="ghost" onClick={() => router.back()} className="mb-4">
        <ArrowLeft className="w-4 h-4 mr-2" />
        返回
      </Button>

      <div className="mb-4 p-3 bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700 rounded-lg">
        <p className="text-sm text-yellow-800 dark:text-yellow-200">
          ⚠️ 預覽模式 - 僅管理員可見
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col space-y-2">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold">{announcement.title}</h2>
              <p className="text-sm text-muted-foreground">
                {formatInTimeZone(
                  new Date(announcement.published_at),
                  "Asia/Taipei",
                  "yyyy-MM-dd"
                )}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {announcement.author_avatar_url && announcement.author_name && (
                <>
                  <Avatar>
                    <AvatarImage
                      src={announcement.author_avatar_url}
                      alt={announcement.author_name}
                    />
                    <AvatarFallback>
                      {announcement.author_name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-semibold">{announcement.author_name}</p>
                  </div>
                </>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-3 prose-p:leading-7 prose-p:mb-4 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-medium prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-strong:font-semibold prose-strong:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-table:border-collapse prose-th:border prose-th:border-border prose-th:bg-muted prose-th:p-2 prose-td:border prose-td:border-border prose-td:p-2">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {parseDiscordTimestamp(announcement.content)}
            </ReactMarkdown>
          </div>
          {announcement.image_url && (
            <div className="mt-4 flex justify-center">
              <Image
                src={announcement.image_url}
                alt={`Announcement ${announcement.id} image`}
                width={600}
                height={400}
                className="rounded-lg"
              />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

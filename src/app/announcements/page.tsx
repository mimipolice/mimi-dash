"use client";

import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import apiClient, { Announcement } from "@/lib/apiClient";
import { formatInTimeZone } from "date-fns-tz";
import { useTranslations } from "next-intl";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";

export default function AnnouncementsPage() {
  const t = useTranslations("announcements");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnnouncements = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiClient.getAnnouncements();
      setAnnouncements(data);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // 初始加載
  useEffect(() => {
    fetchAnnouncements();
  }, [fetchAnnouncements]);

  // 自動刷新（每 30 秒）
  useAutoRefresh({
    interval: 30000,
    enabled: true,
    onRefresh: fetchAnnouncements,
  });

  if (loading) {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <h1 className="mb-6 text-3xl font-bold">{t("title")}</h1>
        <p>{t("loading")}</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-2xl py-8">
        <h1 className="mb-6 text-3xl font-bold">{t("title")}</h1>
        <p>Error: {error}</p>
      </div>
    );
  }

  return (
    <>
      {announcements.map((announcement) => (
        <Card key={announcement.id}>
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
                      <p className="font-semibold">
                        {announcement.author_name}
                      </p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{ __html: announcement.content }}
            />
            {announcement.image_url && (
              <div className="mt-4">
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
      ))}
    </>
  );
}

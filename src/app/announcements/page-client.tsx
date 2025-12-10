"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { motion, AnimatePresence } from "framer-motion";
import apiClient, { Announcement } from "@/lib/apiClient";
import { formatInTimeZone } from "date-fns-tz";
import { useTranslations } from "next-intl";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { parseDiscordTimestamp } from "@/lib/discord-timestamp";
import { DynamicOGUpdater } from "@/components/announcements/dynamic-og-updater";

function safeUrlTransform(url: string) {
  const protocols = ["http", "https", "mailto", "tel"];
  const parsed = new URL(url, "http://localhost");
  if (protocols.includes(parsed.protocol.slice(0, -1))) {
    return url;
  }
  return url;
}

export default function AnnouncementsPage() {
  const t = useTranslations("announcements");
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const hasScrolled = useRef(false);

  const fetchAnnouncements = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const data = await apiClient.getAnnouncements();

      // 過濾掉未來的公告（只顯示已發布的）
      const now = new Date();
      now.setHours(0, 0, 0, 0); // 設定為今天 00:00

      const publishedAnnouncements = data.filter((announcement) => {
        const publishDate = new Date(announcement.published_at);
        publishDate.setHours(0, 0, 0, 0);
        return publishDate <= now;
      });

      setAnnouncements(publishedAnnouncements);
      setError(null);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  // 初始加載
  useEffect(() => {
    fetchAnnouncements(true);
  }, [fetchAnnouncements]);

  // 處理 URL 路徑或 hash，自動展開並滾動到指定公告
  useEffect(() => {
    if (announcements.length === 0 || hasScrolled.current) return;

    // 檢查路徑 /announcements/123 或 hash #123
    const pathMatch = window.location.pathname.match(/\/announcements\/(\d+)/);
    const hash = window.location.hash.slice(1);
    const idStr = pathMatch ? pathMatch[1] : hash;

    if (idStr) {
      const id = parseInt(idStr);
      if (!isNaN(id)) {
        const announcement = announcements.find((a) => a.id === id);
        if (announcement) {
          setExpandedId(id);
          hasScrolled.current = true;

          // 等待 DOM 更新後滾動
          setTimeout(() => {
            const element = document.getElementById(`announcement-${id}`);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 300);
        }
      }
    }
  }, [announcements]);

  // 監聽瀏覽器前進/後退按鈕
  useEffect(() => {
    const handlePopState = () => {
      const pathMatch = window.location.pathname.match(
        /\/announcements\/(\d+)/
      );
      const hash = window.location.hash.slice(1);
      const idStr = pathMatch ? pathMatch[1] : hash;

      if (idStr) {
        const id = parseInt(idStr);
        if (!isNaN(id)) {
          setExpandedId(id);
          setTimeout(() => {
            const element = document.getElementById(`announcement-${id}`);
            if (element) {
              element.scrollIntoView({ behavior: "smooth", block: "center" });
            }
          }, 100);
        }
      } else {
        setExpandedId(null);
      }
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // 自動刷新（每 30 秒）
  useAutoRefresh({
    interval: 30000,
    enabled: true,
    onRefresh: fetchAnnouncements,
  });

  if (loading) {
    return <p>{t("loading")}</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  if (announcements.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <p className="text-2xl text-muted-foreground">
          Σヽ(ﾟД ﾟ; )ﾉ 本站尚無公告
        </p>
      </div>
    );
  }

  const handleToggle = (id: number, isExpanded: boolean) => {
    setExpandedId(isExpanded ? id : null);

    // 更新 URL（不刷新頁面）
    if (isExpanded) {
      window.history.pushState(null, "", `/announcements/${id}`);
    } else {
      window.history.pushState(null, "", "/announcements");
    }
  };

  return (
    <>
      <DynamicOGUpdater announcements={announcements} />
      {announcements.map((announcement) => (
        <AnnouncementCard
          key={announcement.id}
          announcement={announcement}
          isExpanded={expandedId === announcement.id}
          onToggle={handleToggle}
        />
      ))}
    </>
  );
}

function AnnouncementCard({
  announcement,
  isExpanded,
  onToggle,
}: {
  announcement: Announcement;
  isExpanded: boolean;
  onToggle: (id: number, isExpanded: boolean) => void;
}) {
  const [viewCount, setViewCount] = useState(announcement.view_count);
  const [hasRecordedView, setHasRecordedView] = useState(false);

  // 提取前 150 字作為預覽
  const previewText = announcement.content.substring(0, 150) + "...";

  // 當展開時記錄瀏覽
  useEffect(() => {
    if (isExpanded && !hasRecordedView) {
      setHasRecordedView(true);
      apiClient
        .recordAnnouncementView(announcement.id)
        .then((data) => {
          setViewCount(data.view_count);
        })
        .catch((err) => {
          // 429 錯誤是正常的（防刷機制），靜默忽略
          if (err.status !== 429) {
            console.error("Failed to record view:", err);
          }
        });
    }
  }, [isExpanded, hasRecordedView, announcement.id]);

  return (
    <motion.div
      id={`announcement-${announcement.id}`}
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* 預載入完整圖片（隱藏） */}
      {announcement.image_url && !isExpanded && (
        <div className="hidden">
          <Image
            src={announcement.image_url}
            alt="preload"
            width={600}
            height={400}
            priority
          />
        </div>
      )}

      <Card
        className="cursor-pointer hover:shadow-lg transition-shadow duration-300 overflow-hidden"
        onClick={() => onToggle(announcement.id, !isExpanded)}
      >
        <AnimatePresence mode="wait">
          {isExpanded ? (
            // 展開狀態 - 完整內容
            <motion.div
              key="expanded"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <CardHeader>
                <div className="flex flex-col space-y-2">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <Badge
                        variant={
                          announcement.severity === "alert"
                            ? "destructive"
                            : "secondary"
                        }
                        className={
                          announcement.severity === "warning"
                            ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20 mb-4 flex items-center justify-center leading-none py-1.5"
                            : "mb-4 flex items-center justify-center leading-none py-1.5"
                        }
                      >
                        {announcement.severity === "alert"
                          ? "重要"
                          : announcement.severity === "warning"
                          ? "警告"
                          : "資訊"}
                      </Badge>
                      <h2 className="text-2xl font-bold">
                        {announcement.title}
                      </h2>
                    </div>
                    <Badge
                      variant="outline"
                      className="flex items-center justify-center leading-none py-1.5"
                      style={{
                        backgroundColor: "hsl(210 40% 98%)",
                        color: "hsl(222.2 84% 4.9%)",
                      }}
                    >
                      {formatInTimeZone(
                        new Date(announcement.published_at),
                        "Asia/Taipei",
                        "yyyy-MM-dd"
                      )}
                    </Badge>
                  </div>
                  <div className="flex items-center space-x-4">
                    {announcement.author_avatar_url &&
                      announcement.author_name && (
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
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1, duration: 0.3 }}
                  className="prose prose-slate dark:prose-invert max-w-none prose-headings:font-bold prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-3 prose-p:leading-7 prose-p:mb-4 prose-a:text-blue-600 dark:prose-a:text-blue-400 prose-a:font-medium prose-blockquote:border-l-4 prose-blockquote:border-primary prose-blockquote:pl-4 prose-blockquote:italic prose-strong:font-semibold prose-strong:text-foreground prose-code:bg-muted prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm prose-code:font-mono prose-pre:bg-muted prose-pre:p-4 prose-pre:rounded-lg prose-table:border-collapse prose-th:border prose-th:border-border prose-th:bg-muted prose-th:p-2 prose-td:border prose-td:border-border prose-td:p-2"
                >
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    urlTransform={safeUrlTransform}
                  >
                    {parseDiscordTimestamp(announcement.content)}
                  </ReactMarkdown>
                </motion.div>
                {announcement.image_url && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    className="mt-4 flex justify-center"
                  >
                    <Image
                      src={announcement.image_url}
                      alt={`Announcement ${announcement.id} image`}
                      width={600}
                      height={400}
                      className="rounded-lg"
                    />
                  </motion.div>
                )}
              </CardContent>
            </motion.div>
          ) : (
            // 折疊狀態 - 預覽
            <motion.div
              key="collapsed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="flex items-start gap-4 p-4"
            >
              {announcement.image_url && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                  className="flex-shrink-0 w-32 h-32 relative rounded-lg overflow-hidden"
                >
                  <Image
                    src={announcement.image_url}
                    alt={`Announcement ${announcement.id} preview`}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              )}
              <div className="flex-1 min-w-0 flex flex-col">
                <div className="flex items-start justify-between gap-3 mb-4">
                  <Badge
                    variant={
                      announcement.severity === "alert"
                        ? "destructive"
                        : "secondary"
                    }
                    className={
                      announcement.severity === "warning"
                        ? "bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 border-yellow-500/20 flex items-center justify-center leading-none py-1.5"
                        : "flex items-center justify-center leading-none py-1.5"
                    }
                  >
                    {announcement.severity === "alert"
                      ? "重要"
                      : announcement.severity === "warning"
                      ? "警告"
                      : "資訊"}
                  </Badge>
                  <Badge
                    variant="outline"
                    className="flex items-center justify-center leading-none py-1.5"
                    style={{
                      backgroundColor: "hsl(210 40% 98%)",
                      color: "hsl(222.2 84% 4.9%)",
                    }}
                  >
                    {formatInTimeZone(
                      new Date(announcement.published_at),
                      "Asia/Taipei",
                      "yyyy-MM-dd"
                    )}
                  </Badge>
                </div>
                <h3 className="text-lg font-bold line-clamp-2 mb-2">
                  {announcement.title}
                </h3>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                  {previewText}
                </p>
                <div className="flex items-end justify-between mt-auto">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    {announcement.author_name && (
                      <>
                        {announcement.author_avatar_url && (
                          <Avatar className="w-4 h-4">
                            <AvatarImage
                              src={announcement.author_avatar_url}
                              alt={announcement.author_name}
                            />
                            <AvatarFallback className="text-[10px]">
                              {announcement.author_name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <span>{announcement.author_name}</span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mr-2 mt-1">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                    <span>{viewCount}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  );
}

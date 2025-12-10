"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Announcement } from "@/lib/apiClient";
import { formatInTimeZone } from "date-fns-tz";
import { parseDiscordTimestamp } from "@/lib/discord-timestamp";

interface AnnouncementPreviewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: Announcement | null;
}

export function AnnouncementPreviewDialog({
  open,
  onOpenChange,
  announcement,
}: AnnouncementPreviewDialogProps) {
  if (!announcement) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>公告預覽</DialogTitle>
        </DialogHeader>
        <Card className="border-0 shadow-none">
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
      </DialogContent>
    </Dialog>
  );
}

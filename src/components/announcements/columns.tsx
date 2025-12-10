"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Announcement } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { deleteAnnouncement } from "@/lib/api/announcements";

export const getColumns = (
  t: any, // Replace with a more specific type if you have one for next-intl
  handleEdit: (announcement: Announcement) => void,
  handlePreview: (announcement: Announcement) => void,
  refreshAnnouncements: () => void
): ColumnDef<Announcement>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("table.titleHeader")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
  },
  {
    accessorKey: "severity",
    header: t("table.severityHeader"),
    cell: ({ row }) => {
      const severity = row.getValue("severity") as string;
      const variant =
        severity === "alert"
          ? "destructive"
          : severity === "warning"
          ? "warning"
          : "default";
      return <Badge variant={variant}>{severity}</Badge>;
    },
  },
  {
    accessorKey: "published_at",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          {t("table.publishedAtHeader")}
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("published_at"));
      const now = new Date();
      now.setHours(0, 0, 0, 0);
      const publishDate = new Date(date);
      publishDate.setHours(0, 0, 0, 0);
      const isPublished = publishDate <= now;

      return (
        <div className="flex items-center gap-2">
          <span>{new Intl.DateTimeFormat("en-CA").format(date)}</span>
          {!isPublished && (
            <Badge variant="outline" className="text-xs">
              未發布
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "view_count",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          瀏覽次數
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const viewCount = row.getValue("view_count") as number;
      return (
        <div className="flex items-center gap-1">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-muted-foreground"
          >
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
          </svg>
          <span>{viewCount.toLocaleString()}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const announcement = row.original;

      const handleDelete = async () => {
        toast.promise(deleteAnnouncement(announcement.id.toString()), {
          loading: t("toasts.deleting"),
          success: () => {
            refreshAnnouncements();
            return t("toasts.deleteSuccess");
          },
          error: (err) => err.message || t("toasts.deleteError"),
        });
      };

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("table.actionsLabel")}</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => handlePreview(announcement)}>
              {t("table.previewDialogAction")}
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                // 如果公告已發布，使用動態路由（支援 OG）；未發布則用 preview 頁面
                const now = new Date();
                now.setHours(0, 0, 0, 0);
                const publishDate = new Date(announcement.published_at);
                publishDate.setHours(0, 0, 0, 0);

                const url =
                  publishDate <= now
                    ? `/announcements/${announcement.id}`
                    : `/announcements/preview/${announcement.id}`;

                window.open(url, "_blank");
              }}
            >
              {t("table.previewPageAction")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleEdit(announcement)}>
              {t("table.editAction")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDelete}>
              {t("table.deleteAction")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];

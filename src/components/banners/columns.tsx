"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Banner } from "@/lib/apiClient";
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
import { deleteBanner } from "@/lib/api/banners"; // We will create this
import { format, parseISO } from "date-fns";

export const getColumns = (
  t: any,
  handleEdit: (banner: Banner) => void,
  refreshBanners: () => void
): ColumnDef<Banner>[] => [
  {
    accessorKey: "title",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {t("table.titleHeader")}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "short_description",
    header: t("table.shortDescriptionHeader"),
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
    id: "displayRange",
    header: t("table.displayRangeHeader"),
    cell: ({ row }) => {
      const { display_from, display_until } = row.original;
      const formatDate = (dateString?: string | null) =>
        dateString ? format(parseISO(dateString), "yyyy-MM-dd") : "N/A";

      // 計算狀態
      const now = new Date();
      let status: "未發布" | "進行中" | "已過期" | null = null;

      if (display_from && display_until) {
        const fromDate = parseISO(display_from);
        const untilDate = parseISO(display_until);

        if (now < fromDate) {
          status = "未發布";
        } else if (now > untilDate) {
          status = "已過期";
        } else {
          status = "進行中";
        }
      }

      return (
        <div className="flex items-center gap-2">
          <span>{`${formatDate(display_from)} - ${formatDate(
            display_until
          )}`}</span>
          {status && (
            <Badge
              variant="outline"
              className={
                status === "未發布"
                  ? "text-xs bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
                  : status === "已過期"
                  ? "text-xs bg-gray-50 dark:bg-gray-900 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-700"
                  : "text-xs bg-green-50 dark:bg-green-950 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800"
              }
            >
              {status}
            </Badge>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const banner = row.original;

      const handleDelete = async () => {
        toast.promise(deleteBanner(banner.id), {
          loading: t("toasts.deleting"),
          success: () => {
            refreshBanners();
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
            <DropdownMenuItem onClick={() => handleEdit(banner)}>
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

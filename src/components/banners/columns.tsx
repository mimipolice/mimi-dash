"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Banner } from "@/lib/banners";
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
      return `${formatDate(display_from)} - ${formatDate(display_until)}`;
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

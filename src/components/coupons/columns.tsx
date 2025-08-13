"use client";

import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Coupon } from "@/lib/api/coupons";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";
import { CouponActionsCell } from "./coupon-actions-cell";

export const getColumns = (
  t: (key: string, params?: any) => string,
  handleEdit: (coupon: Coupon) => void,
  refreshCoupons: () => void
): ColumnDef<Coupon>[] => [
  {
    accessorKey: "code",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {t("table.codeHeader")}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const code = row.getValue("code") as string;
      const handleCopy = () => {
        navigator.clipboard.writeText(code);
        toast.success(`Copied "${code}" to clipboard`);
      };

      return (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" onClick={handleCopy}>
                {code}
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p>{t("table.copyTooltip") || "Click to copy"}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      );
    },
  },
  {
    accessorKey: "reward_amount",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {t("table.rewardAmountHeader")}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "usage_limit",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {t("table.usageLimitHeader")}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "actual_used_count",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {t("table.usedCountHeader")}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
  },
  {
    accessorKey: "expires_at",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {t("table.expiresAtHeader")}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const expiresAt = row.getValue("expires_at");
      if (!expiresAt) {
        return t("status.permanent");
      }
      const date = new Date(expiresAt as string);
      return isNaN(date.getTime())
        ? t("table.notAvailable")
        : date.toLocaleString();
    },
  },
  {
    accessorKey: "created_at",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {t("table.createdAtHeader")}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("created_at"));
      return isNaN(date.getTime())
        ? t("table.notAvailable")
        : date.toLocaleString();
    },
  },
  {
    accessorKey: "updated_at",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {t("table.updatedAtHeader")}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const date = new Date(row.getValue("updated_at"));
      return isNaN(date.getTime())
        ? t("table.notAvailable")
        : date.toLocaleString();
    },
  },
  {
    accessorKey: "is_active",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        {t("table.statusHeader")}
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <Badge variant={row.getValue("is_active") ? "default" : "secondary"}>
        {row.getValue("is_active") ? t("status.active") : t("status.inactive")}
      </Badge>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <CouponActionsCell
        coupon={row.original}
        t={t}
        handleEdit={handleEdit}
        refreshCoupons={refreshCoupons}
      />
    ),
  },
];

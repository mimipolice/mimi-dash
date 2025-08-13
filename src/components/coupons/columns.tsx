"use client";

import { useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Coupon,
  deleteCoupon,
  fetchCouponUsage,
  CouponUsageData,
} from "@/lib/api/coupons";
import { UsageDetailsDialog } from "./usage-details-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { toast } from "sonner";

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
    cell: ({ row }) => {
      const coupon = row.original;
      const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
      const [isUsageDialogOpen, setIsUsageDialogOpen] = useState(false);
      const [usageData, setUsageData] = useState<CouponUsageData | null>(null);
      const [isLoadingUsage, setIsLoadingUsage] = useState(false);

      const handleDeleteConfirm = () => {
        toast.promise(deleteCoupon(coupon.id), {
          loading: t("toasts.deleting"),
          success: () => {
            refreshCoupons();
            setIsDeleteDialogOpen(false);
            return t("toasts.deleteSuccess");
          },
          error: (err: any) => err.message || t("toasts.deleteError"),
        });
      };

      const handleViewUsage = async () => {
        setIsUsageDialogOpen(true);
        setIsLoadingUsage(true);
        try {
          const data = await fetchCouponUsage(coupon.id);
          setUsageData(data);
        } catch (error) {
          toast.error(t("toasts.fetchUsageError"));
          setIsUsageDialogOpen(false);
        } finally {
          setIsLoadingUsage(false);
        }
      };

      return (
        <>
          <Dialog
            open={isDeleteDialogOpen}
            onOpenChange={setIsDeleteDialogOpen}
          >
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{t("table.openMenu")}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("table.actionsLabel")}</DropdownMenuLabel>
                <DropdownMenuItem onClick={handleViewUsage}>
                  {t("table.usageDetailsAction")}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleEdit(coupon)}>
                  {t("table.editAction")}
                </DropdownMenuItem>
                <DialogTrigger asChild>
                  <DropdownMenuItem
                    className="text-red-600"
                    onSelect={(e) => e.preventDefault()}
                  >
                    {t("table.deleteAction")}
                  </DropdownMenuItem>
                </DialogTrigger>
              </DropdownMenuContent>
            </DropdownMenu>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t("deleteDialog.title")}</DialogTitle>
                <DialogDescription>
                  {t("deleteDialog.description", { code: coupon.code })}
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">{t("deleteDialog.cancel")}</Button>
                </DialogClose>
                <Button variant="destructive" onClick={handleDeleteConfirm}>
                  {t("deleteDialog.confirm")}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <UsageDetailsDialog
            isOpen={isUsageDialogOpen}
            onClose={() => setIsUsageDialogOpen(false)}
            usageData={usageData}
            isLoading={isLoadingUsage}
          />
        </>
      );
    },
  },
];

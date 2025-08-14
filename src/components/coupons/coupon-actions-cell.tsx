"use client";

import { useState } from "react";
import { MoreHorizontal } from "lucide-react";
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
import {
  Coupon,
  deleteCoupon,
  fetchCouponUsage,
  CouponUsageData,
} from "@/lib/api/coupons";
import { UsageDetailsDialog } from "./usage-details-dialog";
import { toast } from "sonner";

interface CouponActionsCellProps {
  coupon: Coupon;
  t: (key: string, params?: any) => string;
  handleEdit: (coupon: Coupon) => void;
  refreshCoupons: () => void;
}

export const CouponActionsCell: React.FC<CouponActionsCellProps> = ({
  coupon,
  t,
  handleEdit,
  refreshCoupons,
}) => {
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
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
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
};

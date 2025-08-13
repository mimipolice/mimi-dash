"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Coupon } from "@/lib/api/coupons";
import { useTranslations } from "next-intl";

interface CouponFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  coupon: Partial<Coupon> | null;
  setCoupon: (coupon: Partial<Coupon> | null) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function CouponFormDialog({
  open,
  onOpenChange,
  coupon,
  setCoupon,
  onSubmit,
}: CouponFormDialogProps) {
  const t = useTranslations("couponsManagement");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {coupon?.id ? t("dialog.editTitle") : t("dialog.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {coupon?.id
              ? t("dialog.editDescription")
              : t("dialog.createDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                {t("dialog.codeLabel")}
              </Label>
              <Input
                id="code"
                name="code"
                defaultValue={coupon?.code || ""}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reward_amount" className="text-right">
                {t("dialog.rewardAmountLabel")}
              </Label>
              <Input
                id="reward_amount"
                name="reward_amount"
                type="number"
                defaultValue={coupon?.reward_amount || ""}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="usage_limit" className="text-right">
                {t("dialog.usageLimitLabel")}
              </Label>
              <Input
                id="usage_limit"
                name="usage_limit"
                type="number"
                defaultValue={coupon?.usage_limit || ""}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expires_at" className="text-right">
                {t("dialog.expiresAtLabel")}
              </Label>
              <DatePicker
                date={
                  coupon?.expires_at ? new Date(coupon.expires_at) : undefined
                }
                setDate={(date) => {
                  setCoupon({
                    ...coupon,
                    expires_at: date?.toISOString(),
                  } as Partial<Coupon>);
                }}
              />
            </div>
            {coupon?.id && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="is_active" className="text-right">
                  {t("dialog.activeLabel")}
                </Label>
                <Checkbox
                  id="is_active"
                  name="is_active"
                  defaultChecked={coupon?.is_active}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="submit">{t("dialog.saveButton")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

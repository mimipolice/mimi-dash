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
import { DateTimePicker } from "@/components/ui/datetime-picker";
import { Checkbox } from "@/components/ui/checkbox";
import { Coupon } from "@/lib/api/coupons";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 驗證必填欄位
    const newErrors: Record<string, boolean> = {};
    const formData = new FormData(e.currentTarget);

    if (!formData.get("code")) newErrors.code = true;
    if (!formData.get("reward_amount")) newErrors.reward_amount = true;
    if (!formData.get("usage_limit")) newErrors.usage_limit = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(e);
  };

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
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="code" className="text-right">
                {t("dialog.codeLabel")}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="code"
                  name="code"
                  defaultValue={coupon?.code || ""}
                  required
                  className={cn(
                    errors.code &&
                      "border-red-500 focus-visible:ring-red-500 animate-shake"
                  )}
                  onChange={() => setErrors({ ...errors, code: false })}
                />
                {errors.code && (
                  <p className="text-sm text-red-500 animate-fade-in">
                    此欄位為必填
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="reward_amount" className="text-right">
                {t("dialog.rewardAmountLabel")}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="reward_amount"
                  name="reward_amount"
                  type="number"
                  defaultValue={coupon?.reward_amount || ""}
                  required
                  className={cn(
                    errors.reward_amount &&
                      "border-red-500 focus-visible:ring-red-500 animate-shake"
                  )}
                  onChange={() =>
                    setErrors({ ...errors, reward_amount: false })
                  }
                />
                {errors.reward_amount && (
                  <p className="text-sm text-red-500 animate-fade-in">
                    此欄位為必填
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="usage_limit" className="text-right">
                {t("dialog.usageLimitLabel")}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <div className="col-span-3 space-y-1">
                <Input
                  id="usage_limit"
                  name="usage_limit"
                  type="number"
                  defaultValue={coupon?.usage_limit || ""}
                  required
                  className={cn(
                    errors.usage_limit &&
                      "border-red-500 focus-visible:ring-red-500 animate-shake"
                  )}
                  onChange={() => setErrors({ ...errors, usage_limit: false })}
                />
                {errors.usage_limit && (
                  <p className="text-sm text-red-500 animate-fade-in">
                    此欄位為必填
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="expires_at" className="text-right">
                {t("dialog.expiresAtLabel")}
              </Label>
              <div className="col-span-3">
                <DateTimePicker
                  value={
                    coupon?.expires_at ? new Date(coupon.expires_at) : null
                  }
                  onChange={(date) => {
                    setCoupon({
                      ...coupon,
                      expires_at: date?.toISOString(),
                    } as Partial<Coupon>);
                  }}
                  placeholder="選擇到期時間"
                  includeTime={true}
                />
              </div>
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

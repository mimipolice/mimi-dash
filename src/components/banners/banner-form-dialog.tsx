"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Banner } from "@/lib/apiClient";
import { useTranslations } from "next-intl";
import { parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Combobox } from "@/components/ui/combobox";
import { useState } from "react";
import { DateTimePicker } from "@/components/ui/datetime-picker";

interface BannerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner: Partial<Banner> | null;
  setBanner: (banner: Partial<Banner> | null) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  routeOptions: { label: string; value: string }[];
}

export function BannerFormDialog({
  open,
  onOpenChange,
  banner,
  setBanner,
  onSubmit,
  routeOptions,
}: BannerFormDialogProps) {
  const t = useTranslations("bannersManagement.dialog");
  const tSeverity = useTranslations("bannersManagement.severities");
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const isEditing = !!banner?.id;

  const handleDateChange = (
    field: "display_from" | "display_until",
    date: Date | null
  ) => {
    setBanner({ ...banner, [field]: date ? date.toISOString() : undefined });
    if (date) {
      setErrors({ ...errors, [field]: false });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 驗證必填欄位
    const newErrors: Record<string, boolean> = {};
    const formData = new FormData(e.currentTarget);

    if (!formData.get("title")) newErrors.title = true;
    if (!formData.get("severity")) newErrors.severity = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(e);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("editTitle") : t("createTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t("editDescription") : t("createDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">
              {t("titleLabel")}
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              defaultValue={banner?.title || ""}
              required
              className={cn(
                errors.title &&
                  "border-red-500 focus-visible:ring-red-500 animate-shake"
              )}
              onChange={() => setErrors({ ...errors, title: false })}
            />
            {errors.title && (
              <p className="text-sm text-red-500 animate-fade-in">
                此欄位為必填
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">
              {t("shortDescriptionLabel")}
            </Label>
            <Input
              id="shortDescription"
              name="shortDescription"
              defaultValue={banner?.short_description || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">{t("urlLabel")}</Label>
            <div className="flex gap-2">
              <Input
                id="url"
                name="url"
                value={banner?.url || ""}
                onChange={(e) => setBanner({ ...banner, url: e.target.value })}
                placeholder="Select a route 或自訂 URL"
                className="flex-1"
              />
              <Select
                value=""
                onValueChange={(value) => setBanner({ ...banner, url: value })}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="快速選擇" />
                </SelectTrigger>
                <SelectContent>
                  {routeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-xs text-muted-foreground">
              可直接輸入 URL 或使用快速選擇
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">
              {t("severityLabel")}
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Select
              name="severity"
              defaultValue={banner?.severity || "info"}
              onValueChange={() => setErrors({ ...errors, severity: false })}
            >
              <SelectTrigger
                className={cn(
                  errors.severity &&
                    "border-red-500 focus-visible:ring-red-500 animate-shake"
                )}
              >
                <SelectValue placeholder="Select a severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">{tSeverity("info")}</SelectItem>
                <SelectItem value="warning">{tSeverity("warning")}</SelectItem>
                <SelectItem value="alert">{tSeverity("alert")}</SelectItem>
              </SelectContent>
            </Select>
            {errors.severity && (
              <p className="text-sm text-red-500 animate-fade-in">
                此欄位為必填
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayFrom">{t("displayFromLabel")}</Label>
              <DateTimePicker
                value={
                  banner?.display_from ? parseISO(banner.display_from) : null
                }
                onChange={(date) => handleDateChange("display_from", date)}
                placeholder="選擇開始時間"
                includeTime={true}
              />
              <Input
                type="hidden"
                name="display_from"
                value={banner?.display_from || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayUntil">{t("displayUntilLabel")}</Label>
              <DateTimePicker
                value={
                  banner?.display_until ? parseISO(banner.display_until) : null
                }
                onChange={(date) => handleDateChange("display_until", date)}
                placeholder="選擇結束時間"
                includeTime={true}
              />
              <Input
                type="hidden"
                name="display_until"
                value={banner?.display_until || ""}
              />
            </div>
          </div>

          <Button type="submit">{t("saveButton")}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

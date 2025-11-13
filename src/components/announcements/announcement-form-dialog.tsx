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
import { Textarea } from "@/components/ui/textarea";
import { Announcement } from "@/lib/apiClient";
import { useTranslations } from "next-intl";
import { Combobox } from "@/components/ui/combobox";
import { useState } from "react";
import { parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { DateTimePicker } from "@/components/ui/datetime-picker";

interface AnnouncementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: Partial<Announcement> | null;
  setAnnouncement: (announcement: Partial<Announcement> | null) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
  imageOptions: { label: string; value: string }[];
}

export function AnnouncementFormDialog({
  open,
  onOpenChange,
  announcement,
  setAnnouncement,
  onSubmit,
  imageOptions,
}: AnnouncementFormDialogProps) {
  const t = useTranslations("announcementsManagement.dialog");
  const tSeverity = useTranslations("announcementsManagement.severities");
  const [errors, setErrors] = useState<Record<string, boolean>>({});

  const isEditing = !!announcement?.id;

  const handleDateChange = (date: Date | null) => {
    if (date) {
      // 使用 Date.UTC 創建 UTC 時間，然後轉為 ISO 字串
      const utcDate = new Date(
        Date.UTC(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
          0,
          0,
          0,
          0
        )
      );
      const isoString = utcDate.toISOString();

      setAnnouncement({
        ...announcement,
        published_at: isoString,
      });
      setErrors({ ...errors, published_at: false });
    } else {
      setAnnouncement({ ...announcement, published_at: undefined });
    }
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // 驗證必填欄位
    const newErrors: Record<string, boolean> = {};
    const formData = new FormData(e.currentTarget);

    if (!formData.get("title")) newErrors.title = true;
    if (!formData.get("content")) newErrors.content = true;
    if (!formData.get("severity")) newErrors.severity = true;
    if (!announcement?.published_at) newErrors.published_at = true;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onSubmit(e);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("editTitle") : t("createTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t("editDescription") : t("createDescription")}
          </DialogDescription>
        </DialogHeader>
        <form
          onSubmit={handleSubmit}
          className="space-y-4 overflow-y-auto flex-1 pr-2"
        >
          <div className="space-y-2">
            <Label htmlFor="title">
              {t("titleLabel")}
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Input
              id="title"
              name="title"
              defaultValue={announcement?.title || ""}
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
            <Label htmlFor="content">
              {t("contentLabel")}
              <span className="text-red-500 ml-1">*</span>
            </Label>
            <Textarea
              id="content"
              name="content"
              defaultValue={announcement?.content || ""}
              required
              rows={10}
              className={cn(
                errors.content &&
                  "border-red-500 focus-visible:ring-red-500 animate-shake"
              )}
              onChange={() => setErrors({ ...errors, content: false })}
            />
            {errors.content && (
              <p className="text-sm text-red-500 animate-fade-in">
                此欄位為必填
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="severity">
                {t("severityLabel")}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <Select
                name="severity"
                defaultValue={announcement?.severity || "info"}
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
                  <SelectItem value="warning">
                    {tSeverity("warning")}
                  </SelectItem>
                  <SelectItem value="alert">{tSeverity("alert")}</SelectItem>
                </SelectContent>
              </Select>
              {errors.severity && (
                <p className="text-sm text-red-500 animate-fade-in">
                  此欄位為必填
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="published_at">
                {t("publishedAtLabel")}
                <span className="text-red-500 ml-1">*</span>
              </Label>
              <DateTimePicker
                value={
                  announcement?.published_at
                    ? parseISO(announcement.published_at)
                    : null
                }
                onChange={handleDateChange}
                placeholder="選擇發布日期"
                required={true}
                error={errors.published_at}
                includeTime={false}
              />
              <Input
                type="hidden"
                name="published_at"
                value={announcement?.published_at || ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">{t("imageUrlLabel")}</Label>
            <Combobox
              options={imageOptions}
              value={announcement?.image_url || ""}
              onChange={(value) =>
                setAnnouncement({ ...announcement, image_url: value })
              }
              placeholder="Select an image..."
              searchPlaceholder="Search images..."
              noResultsMessage="No images found."
            />
            <Input
              type="hidden"
              name="image_url"
              value={announcement?.image_url || ""}
            />
          </div>

          <Button type="submit">{t("saveButton")}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

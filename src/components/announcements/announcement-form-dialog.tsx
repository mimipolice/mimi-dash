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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Combobox } from "@/components/ui/combobox";
import { useEffect, useState } from "react";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface AnnouncementFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  announcement: Partial<Announcement> | null;
  setAnnouncement: (announcement: Partial<Announcement> | null) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function AnnouncementFormDialog({
  open,
  onOpenChange,
  announcement,
  setAnnouncement,
  onSubmit,
}: AnnouncementFormDialogProps) {
  const t = useTranslations("announcementsManagement.dialog");
  const tSeverity = useTranslations("announcementsManagement.severities");
  const [imageRoutes, setImageRoutes] = useState<
    { label: string; value: string }[]
  >([]);

  useEffect(() => {
    async function fetchImageRoutes() {
      const response = await fetch("/api/images");
      const data = await response.json();
      setImageRoutes(data);
    }
    fetchImageRoutes();
  }, []);

  const isEditing = !!announcement?.id;

  const handleDateChange = (date?: Date) => {
    if (date) {
      // Format the date to a string like "2025-11-09" in the local timezone
      const formattedDate = format(date, "yyyy-MM-dd");
      // Append a fixed time to create a full ISO-like string.
      // This ensures the date is interpreted correctly on the backend.
      setAnnouncement({
        ...announcement,
        published_at: `${formattedDate}T00:00:00.000Z`,
      });
    } else {
      setAnnouncement({ ...announcement, published_at: undefined });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange} modal={false}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? t("editTitle") : t("createTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEditing ? t("editDescription") : t("createDescription")}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("titleLabel")}</Label>
            <Input
              id="title"
              name="title"
              defaultValue={announcement?.title || ""}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="content">{t("contentLabel")}</Label>
            {/* This will be replaced by Tiptap editor */}
            <Textarea
              id="content"
              name="content"
              defaultValue={announcement?.content || ""}
              required
              rows={10}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="severity">{t("severityLabel")}</Label>
              <Select
                name="severity"
                defaultValue={announcement?.severity || "info"}
              >
                <SelectTrigger>
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
            </div>
            <div className="space-y-2">
              <Label htmlFor="published_at">{t("publishedAtLabel")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !announcement?.published_at && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {announcement?.published_at ? (
                      format(parseISO(announcement.published_at), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={
                      announcement?.published_at
                        ? parseISO(announcement.published_at)
                        : undefined
                    }
                    onSelect={handleDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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
              options={imageRoutes}
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

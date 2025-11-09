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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { Announcement as Banner } from "@/lib/announcements"; // We'll create a new Banner type later
import { useTranslations } from "next-intl";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface BannerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  banner: Partial<Banner> | null;
  setBanner: (banner: Partial<Banner> | null) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}

export function BannerFormDialog({
  open,
  onOpenChange,
  banner,
  setBanner,
  onSubmit,
}: BannerFormDialogProps) {
  const t = useTranslations("bannersManagement.dialog");
  const tSeverity = useTranslations("bannersManagement.severities");

  const isEditing = !!banner?.id;

  const handleDateChange = (
    field: "displayFrom" | "displayUntil",
    date?: Date
  ) => {
    setBanner({ ...banner, [field]: date?.toISOString() });
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
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">{t("titleLabel")}</Label>
            <Input
              id="title"
              name="title"
              defaultValue={banner?.title || ""}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription">
              {t("shortDescriptionLabel")}
            </Label>
            <Input
              id="shortDescription"
              name="shortDescription"
              defaultValue={banner?.shortDescription || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">{t("urlLabel")}</Label>
            <Input
              id="url"
              name="url"
              defaultValue={banner?.url || ""}
              placeholder="/docs/community"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="severity">{t("severityLabel")}</Label>
            <Select name="severity" defaultValue={banner?.severity || "info"}>
              <SelectTrigger>
                <SelectValue placeholder="Select a severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="info">{tSeverity("info")}</SelectItem>
                <SelectItem value="warning">{tSeverity("warning")}</SelectItem>
                <SelectItem value="alert">{tSeverity("alert")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="displayFrom">{t("displayFromLabel")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !banner?.displayFrom && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {banner?.displayFrom ? (
                      format(parseISO(banner.displayFrom), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={
                      banner?.displayFrom
                        ? parseISO(banner.displayFrom)
                        : undefined
                    }
                    onSelect={(date) => handleDateChange("displayFrom", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="hidden"
                name="displayFrom"
                value={banner?.displayFrom || ""}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="displayUntil">{t("displayUntilLabel")}</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !banner?.displayUntil && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {banner?.displayUntil ? (
                      format(parseISO(banner.displayUntil), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={
                      banner?.displayUntil
                        ? parseISO(banner.displayUntil)
                        : undefined
                    }
                    onSelect={(date) => handleDateChange("displayUntil", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="hidden"
                name="displayUntil"
                value={banner?.displayUntil || ""}
              />
            </div>
          </div>

          <Button type="submit">{t("saveButton")}</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

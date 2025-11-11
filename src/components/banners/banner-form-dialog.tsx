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
import { type Banner } from "@/lib/apiClient";
import { useTranslations } from "next-intl";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { Combobox } from "@/components/ui/combobox";
import { useEffect, useState } from "react";

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
  const [routes, setRoutes] = useState<{ label: string; value: string }[]>([]);

  useEffect(() => {
    async function fetchRoutes() {
      const response = await fetch("/api/docs");
      const data = await response.json();
      setRoutes(data);
    }
    fetchRoutes();
  }, []);

  const isEditing = !!banner?.id;

  const handleDateChange = (
    field: "display_from" | "display_until",
    date?: Date
  ) => {
    setBanner({ ...banner, [field]: date ? date.toISOString() : undefined });
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
              defaultValue={banner?.short_description || ""}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="url">{t("urlLabel")}</Label>
            <Combobox
              options={routes}
              value={banner?.url || ""}
              onChange={(value) => setBanner({ ...banner, url: value })}
              placeholder="Select a route..."
              searchPlaceholder="Search routes..."
              noResultsMessage="No routes found."
            />
            <Input type="hidden" name="url" value={banner?.url || ""} />
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
                      !banner?.display_from && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {banner?.display_from ? (
                      format(parseISO(banner.display_from), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={
                      banner?.display_from
                        ? parseISO(banner.display_from)
                        : undefined
                    }
                    onSelect={(date) => handleDateChange("display_from", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
              <Input
                type="hidden"
                name="display_from"
                value={banner?.display_from || ""}
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
                      !banner?.display_until && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {banner?.display_until ? (
                      format(parseISO(banner.display_until), "PPP")
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={
                      banner?.display_until
                        ? parseISO(banner.display_until)
                        : undefined
                    }
                    onSelect={(date) => handleDateChange("display_until", date)}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
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

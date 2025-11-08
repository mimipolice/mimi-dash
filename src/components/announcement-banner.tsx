"use client";

import { useState } from "react";
import { Megaphone, Info, TriangleAlert, ShieldAlert, X } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

type AnnouncementSeverity = "info" | "warning" | "alert";

interface AnnouncementBannerProps {
  id: string | number;
  title: string;
  shortDescription: string;
  url: string;
  severity?: AnnouncementSeverity;
}

const severityConfig = {
  info: {
    icon: Info,
    bgColor: "bg-blue-500",
    textColor: "text-white",
  },
  warning: {
    icon: TriangleAlert,
    bgColor: "bg-yellow-500",
    textColor: "text-black",
  },
  alert: {
    icon: ShieldAlert,
    bgColor: "bg-red-500",
    textColor: "text-white",
  },
};

export function AnnouncementBanner({
  id,
  title,
  shortDescription,
  url,
  severity = "info",
}: AnnouncementBannerProps) {
  const [isVisible, setIsVisible] = useState(true);
  const t = useTranslations("announcement");

  const config = severityConfig[severity];
  const Icon = config.icon;

  if (!isVisible) {
    return null;
  }

  return (
    <div
      className={cn(
        "rounded-lg p-4 my-4 flex items-center justify-between",
        config.bgColor,
        config.textColor
      )}
    >
      <div className="flex items-center">
        <Icon className="mr-3 h-6 w-6" />
        <p className="text-sm font-medium">
          <Link href={url} className="hover:underline font-bold">
            {title}
          </Link>
          <span className="ml-2 hidden sm:inline">{shortDescription}</span>
        </p>
      </div>
      <button
        onClick={() => setIsVisible(false)}
        className="ml-4 p-1 rounded-full hover:bg-white/20 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-5 w-5" />
      </button>
    </div>
  );
}

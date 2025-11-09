"use client";

import { useState, useEffect } from "react";
import {
  Info,
  TriangleAlert,
  ShieldAlert,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

import { Banner } from "@/lib/apiClient";

interface AnnouncementBannerProps {
  announcements: Banner[];
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
  announcements = [],
}: AnnouncementBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dismissed, setDismissed] = useState<Array<string | number>>([]);

  const activeAnnouncements = announcements.filter(
    (ann) => !dismissed.includes(ann.id)
  );

  useEffect(() => {
    if (activeAnnouncements.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentIndex(
        (prevIndex) => (prevIndex + 1) % activeAnnouncements.length
      );
    }, 8000); // Rotate every 8 seconds

    return () => clearInterval(timer);
  }, [activeAnnouncements.length]);

  const handleDismiss = (id: string | number) => {
    setDismissed((prev) => [...prev, id]);
  };

  const handlePrev = () => {
    setCurrentIndex(
      (prevIndex) =>
        (prevIndex - 1 + activeAnnouncements.length) %
        activeAnnouncements.length
    );
  };

  const handleNext = () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex + 1) % activeAnnouncements.length
    );
  };

  if (activeAnnouncements.length === 0) {
    return null;
  }

  const currentAnnouncement = activeAnnouncements[currentIndex];
  const config = severityConfig[currentAnnouncement.severity || "info"];
  const Icon = config.icon;

  return (
    <div className="relative overflow-hidden">
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={currentAnnouncement.id}
          initial={{ x: 300, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: -300, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className={cn(
            "rounded-lg p-4 my-4 flex items-center justify-between h-20",
            config.bgColor,
            config.textColor
          )}
        >
          <div className="flex items-center flex-1 min-w-0">
            <Icon className="mr-3 h-6 w-6 flex-shrink-0" />
            <p className="text-base font-medium truncate">
              {currentAnnouncement.url ? (
                <Link
                  href={currentAnnouncement.url}
                  className="hover:underline font-semibold"
                >
                  {currentAnnouncement.title}
                </Link>
              ) : (
                <span className="font-semibold">
                  {currentAnnouncement.title}
                </span>
              )}
              <span className="ml-2 hidden sm:inline font-normal">
                {currentAnnouncement.short_description}
              </span>
            </p>
          </div>
          <div className="flex items-center ml-4">
            {/* {activeAnnouncements.length > 1 && (
              <>
                <button
                  onClick={handlePrev}
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Previous"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1 rounded-full hover:bg-white/20 transition-colors"
                  aria-label="Next"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )} */}
            <button
              onClick={() => handleDismiss(currentAnnouncement.id)}
              className="ml-2 p-1 rounded-full hover:bg-white/20 transition-colors"
              aria-label="Dismiss"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
      {activeAnnouncements.length > 1 && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex space-x-2">
          {activeAnnouncements.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={cn(
                "rounded-full transition-all duration-300",
                currentIndex === index
                  ? "w-5 h-2.5 bg-white/50 overflow-hidden"
                  : "w-2.5 h-2.5 bg-white/50"
              )}
            >
              {currentIndex === index && (
                <motion.div
                  className="h-full bg-white"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 7.8, ease: "linear" }}
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { BarChart, Star, Target, Clover, Users, Repeat } from "lucide-react";

// NOTE: The API at /api/gacha/statistics needs to be updated to return this data structure.
interface GachaStatistics {
  basic_stats: {
    total_draws: string;
    unique_cards: string;
    new_cards: string;
    wish_hits: string;
  };
  rarity_distribution: {
    rarity: string;
    count: string;
    percentage: string;
  }[];
  pool_distribution: {
    pool_key: string;
    count: string;
    percentage: string;
  }[];
  luck_analysis: {
    avg_top_tier_draw: string;
    longest_drought: string;
    luck_index: string;
    luck_mood: string;
    luck_mood_emoji: string;
  };
  server_comparison: {
    top_tier_rate_diff: string;
    top_tier_rate_diff_emoji: string;
    user_top_tier_rate: string;
    total_draws_rank: string;
  };
  most_drawn_cards: {
    card_name: string;
    rarity_icon: string; // e.g., 'C', 'R', 'SR' icon/emoji
    draw_count: string;
  }[];
}

export function GachaStatisticsCard() {
  const t = useTranslations("dashboard.gacha-stats");
  const [stats, setStats] = useState<GachaStatistics | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/gacha/statistics");
        if (!response.ok) {
          throw new Error("Failed to fetch gacha statistics");
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      }
    }

    fetchStats();
  }, []);

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>{t("title")}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{t("loading")}</p>
        </CardContent>
      </Card>
    );
  }

  const StatItem = ({ label, value }: { label: string; value: string }) => (
    <div className="flex justify-between items-center text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-semibold">{value}</span>
    </div>
  );

  return (
    <div className="h-full">
      <Card
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full mx-auto h-full flex flex-col md:w-[35rem] relative cursor-pointer overflow-hidden"
      >
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="h-5 w-5 text-blue-500" />
            {t("title")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 flex-grow flex flex-col">
          <div className="space-y-2">
            <StatItem
              label={t("basic_stats.total_draws", { defaultValue: "總抽卡數" })}
              value={stats.basic_stats.total_draws}
            />
            <StatItem
              label={t("basic_stats.unique_cards", {
                defaultValue: "總獲得卡片",
              })}
              value={stats.basic_stats.unique_cards}
            />
            <StatItem
              label={t("basic_stats.new_cards", { defaultValue: "新卡片" })}
              value={stats.basic_stats.new_cards}
            />
            <StatItem
              label={t("basic_stats.wish_hits", { defaultValue: "祈願命中" })}
              value={stats.basic_stats.wish_hits}
            />
          </div>

          <div className="flex-grow flex flex-col justify-center items-center relative min-h-[13.5rem]">
            <AnimatePresence mode="wait">
              {!isExpanded ? (
                <motion.div
                  key="image-container"
                  className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground"
                  exit={{ opacity: 0, transition: { duration: 0.2 } }}
                >
                  <motion.div
                    animate={{
                      y: isHovered ? 0 : 100,
                      opacity: isHovered ? 1 : 0,
                      scale: isHovered ? 1.1 : 1,
                    }}
                    transition={{ type: "spring", stiffness: 200, damping: 25 }}
                    className="h-100 w-100"
                  >
                    <Image
                      src="/images/bg/amamiya-kokoro.png"
                      alt="Amamiya Kokoro"
                      width={500}
                      height={500}
                      className="h-full w-full object-contain transition-all duration-300"
                      style={{
                        filter: isHovered ? "brightness(0.7)" : "brightness(1)",
                      }}
                    />
                  </motion.div>
                  <AnimatePresence>
                    {!isHovered && (
                      <motion.p
                        key="hover-text"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2, delay: 0.1 }}
                        className="absolute pointer-events-none"
                      >
                        {t("hover_for_preview", {
                          defaultValue: "懸停以預覽",
                        })}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </motion.div>
              ) : (
                <motion.div
                  key="details"
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="w-full h-full"
                >
                  <div className="grid grid-cols-1 md:grid-cols-[1.5fr_2fr] gap-x-4 gap-y-2 pt-4 border-t h-full">
                    {/* Rarity Distribution */}
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2 text-sm">
                        <Star className="h-4 w-4 text-yellow-500" />
                        {t("rarity_distribution.title")}
                      </h4>
                      <div className="pl-6 space-y-1">
                        {stats.rarity_distribution.map((r, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center text-xs"
                          >
                            <span>{r.rarity}</span>
                            <span>
                              {r.count}{" "}
                              <span className="text-muted-foreground">
                                ({r.percentage})
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Pool Distribution */}
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2 text-sm">
                        <Target className="h-4 w-4 text-red-500" />
                        {t("pool_distribution.title")}
                      </h4>
                      <div className="pl-6 space-y-1">
                        {stats.pool_distribution.map((p, i) => (
                          <div
                            key={i}
                            className="flex justify-between items-center text-xs"
                          >
                            <span>
                              {t(`pool_distribution.pools.${p.pool_key}`)}
                            </span>
                            <span>
                              {p.count}{" "}
                              <span className="text-muted-foreground">
                                ({p.percentage})
                              </span>
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Luck Analysis */}
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2 text-sm">
                        <Clover className="h-4 w-4 text-green-500" />
                        {t("luck_analysis.title")}
                      </h4>
                      <div className="pl-6 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>{t("luck_analysis.avg_top_tier_draw")}</span>
                          <span>{stats.luck_analysis.avg_top_tier_draw}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("luck_analysis.longest_drought")}</span>
                          <span>{stats.luck_analysis.longest_drought}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("luck_analysis.luck_index")}</span>
                          <span className="text-right">
                            {stats.luck_analysis.luck_index}{" "}
                            {stats.luck_analysis.luck_mood_emoji}{" "}
                            {stats.luck_analysis.luck_mood}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Server Comparison */}
                    <div className="space-y-2">
                      <h4 className="font-semibold flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-purple-500" />
                        {t("server_comparison.title")}
                      </h4>
                      <div className="pl-6 space-y-1 text-xs">
                        <div className="flex justify-between">
                          <span>{t("server_comparison.top_tier_rate")}</span>
                          <span className="text-right">
                            {stats.server_comparison.top_tier_rate_diff}{" "}
                            {stats.server_comparison.top_tier_rate_diff_emoji}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>
                            {t("server_comparison.user_top_tier_rate")}
                          </span>
                          <span>
                            {stats.server_comparison.user_top_tier_rate}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("server_comparison.total_draws_rank")}</span>
                          <span>
                            {stats.server_comparison.total_draws_rank}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Most Drawn Cards */}
                    <div className="space-y-2 md:col-span-2">
                      <h4 className="font-semibold flex items-center gap-2 text-sm">
                        <Repeat className="h-4 w-4 text-indigo-500" />
                        {t("most_drawn.title")}
                      </h4>
                      <div className="pl-6 space-y-1 text-xs">
                        {stats.most_drawn_cards.map((c, i) => (
                          <div key={i} className="flex items-center gap-2">
                            <span>{c.rarity_icon}</span>
                            <span>
                              {c.card_name} - {c.draw_count}{" "}
                              {t("most_drawn.draws")}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

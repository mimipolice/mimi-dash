"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { BarChart, Star, Target, Clover, Users, Repeat } from "lucide-react";

// Helper to format numbers with commas
const formatNumber = (num: number | string) =>
  Number(num).toLocaleString("en-US");

interface GachaStatistics {
  basic_stats: {
    total_draws: number;
    unique_cards: number;
    new_cards: { count: number; percentage: number };
    wish_hits: { count: number; percentage: number };
  };
  rarity_distribution: {
    rarity: string;
    count: number;
    percentage: number;
  }[];
  pool_distribution: {
    pool_key: string;
    count: number;
    percentage: number;
  }[];
  luck_analysis: {
    avg_top_tier_draw: number;
    longest_drought: number;
    luck_index: number;
    luck_mood_key: string;
    luck_mood_emoji: string;
  };
  server_comparison: {
    rate_diff_percentage: number;
    rate_diff_emoji: string;
    user_top_tier_rate: number;
    total_draws_rank: number;
  } | null;
  most_drawn_cards: {
    card_name: string;
    rarity_icon: string;
    draw_count: number;
  }[];
}

const GachaStatisticsSkeleton = () => (
  <Card className="w-full mx-auto h-full flex flex-col md:w-[35rem]">
    <CardHeader>
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-2">
          <Skeleton className="h-6 w-6" />
          <Skeleton className="h-6 w-24" />
        </div>
        <Skeleton className="w-[200px] h-8" />
      </div>
    </CardHeader>
    <CardContent className="space-y-4 flex-grow flex flex-col">
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-1/4" />
        </div>
      </div>
      <div className="flex-grow flex flex-col justify-center items-center relative min-h-[13.5rem]">
        <Skeleton className="h-full w-full" />
      </div>
    </CardContent>
  </Card>
);

export function GachaStatisticsCard() {
  const t = useTranslations("dashboard.gacha-stats");
  const [stats, setStats] = useState<GachaStatistics | null>(null);
  const [selectedPool, setSelectedPool] = useState<string>("all");
  const [availablePools, setAvailablePools] = useState<
    GachaStatistics["pool_distribution"]
  >([]);
  const [error, setError] = useState<string | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);
      setError(null);
      try {
        const url = new URL("/api/gacha/statistics", window.location.origin);
        if (selectedPool !== "all") {
          url.searchParams.append("pool_type", selectedPool);
        }
        const response = await fetch(url.toString());
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(
            errorData.error || "Failed to fetch gacha statistics"
          );
        }
        const data = await response.json();
        setStats(data);

        if (selectedPool === "all" || availablePools.length === 0) {
          setAvailablePools(data.pool_distribution);
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "An unknown error occurred"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, [selectedPool, availablePools.length]);

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

  if (loading) {
    return <GachaStatisticsSkeleton />;
  }

  if (!stats) {
    return null; // or a placeholder/error state
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
          <div className="flex justify-between items-start">
            <CardTitle className="flex items-center gap-2">
              <BarChart className="h-5 w-5 text-blue-500" />
              {t("title")}
            </CardTitle>
            <Select value={selectedPool} onValueChange={setSelectedPool}>
              <SelectTrigger className="w-[200px] h-8 text-xs">
                <SelectValue placeholder={t("pool_selection.placeholder")} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t("pool_selection.all")}</SelectItem>
                {availablePools.map((p) => (
                  <SelectItem key={p.pool_key} value={p.pool_key}>
                    {t(`pool_distribution.pools.${p.pool_key}`)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 flex-grow flex flex-col">
          <div className="space-y-2">
            <StatItem
              label={t("basic_stats.total_draws")}
              value={formatNumber(stats.basic_stats.total_draws)}
            />
            <StatItem
              label={t("basic_stats.unique_cards")}
              value={formatNumber(stats.basic_stats.unique_cards)}
            />
            <StatItem
              label={t("basic_stats.new_cards")}
              value={`${formatNumber(stats.basic_stats.new_cards.count)} (${(
                stats.basic_stats.new_cards.percentage * 100
              ).toFixed(1)}%)`}
            />
            <StatItem
              label={t("basic_stats.wish_hits")}
              value={`${formatNumber(stats.basic_stats.wish_hits.count)} (${(
                stats.basic_stats.wish_hits.percentage * 100
              ).toFixed(1)}%)`}
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
                              {formatNumber(r.count)}{" "}
                              <span className="text-muted-foreground">
                                ({(r.percentage * 100).toFixed(2)}%)
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
                              {formatNumber(p.count)}{" "}
                              <span className="text-muted-foreground">
                                ({(p.percentage * 100).toFixed(1)}%)
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
                          <span>
                            {t("luck_analysis.avg_top_tier_draw_value", {
                              value:
                                stats.luck_analysis.avg_top_tier_draw.toFixed(
                                  1
                                ),
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("luck_analysis.longest_drought")}</span>
                          <span>
                            {t("luck_analysis.longest_drought_value", {
                              value: formatNumber(
                                stats.luck_analysis.longest_drought
                              ),
                            })}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span>{t("luck_analysis.luck_index")}</span>
                          <span className="text-right">
                            {stats.luck_analysis.luck_index.toFixed(2)}{" "}
                            {stats.luck_analysis.luck_mood_emoji}{" "}
                            {t(
                              `luck_analysis.moods.${stats.luck_analysis.luck_mood_key}`
                            )}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Server Comparison */}
                    {stats.server_comparison && (
                      <div className="space-y-2">
                        <h4 className="font-semibold flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-purple-500" />
                          {t("server_comparison.title")}
                        </h4>
                        <div className="pl-6 space-y-1 text-xs">
                          <div className="flex justify-between">
                            <span>{t("server_comparison.top_tier_rate")}</span>
                            <span className="text-right">
                              {t("server_comparison.top_tier_rate_value", {
                                comparison: t(
                                  `server_comparison.${
                                    stats.server_comparison
                                      .rate_diff_percentage > 0
                                      ? "higher"
                                      : "lower"
                                  }`
                                ),
                                value: Math.abs(
                                  stats.server_comparison.rate_diff_percentage
                                ).toFixed(2),
                                emoji: stats.server_comparison.rate_diff_emoji,
                              })}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>
                              {t("server_comparison.user_top_tier_rate")}
                            </span>
                            <span>
                              {stats.server_comparison.user_top_tier_rate.toFixed(
                                3
                              )}
                              %
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span>
                              {t("server_comparison.total_draws_rank")}
                            </span>
                            <span>
                              {t("server_comparison.total_draws_rank_value", {
                                rank: formatNumber(
                                  stats.server_comparison.total_draws_rank
                                ),
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

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
                              {c.card_name} - {formatNumber(c.draw_count)}{" "}
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

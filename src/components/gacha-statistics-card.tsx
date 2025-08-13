"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface GachaStatistics {
  total_draws: string;
  unique_cards_drawn: string;
  new_cards_count: string;
  wish_cards_count: string;
  top_tier_count: string;
  ssr_plus_count: string;
  first_draw_date: string;
  last_draw_date: string;
  rarity_counts: Record<string, number>;
  pool_counts: Record<string, number>;
  most_drawn_cards: {
    card_name: string;
    rarity: number;
    draw_count: string;
  }[];
  longest_drought: string;
}

export function GachaStatisticsCard() {
  const t = useTranslations("dashboard.gacha-stats");
  const [stats, setStats] = useState<GachaStatistics | null>(null);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("title")}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-semibold">{t("total_draws")}</p>
            <p>{stats.total_draws}</p>
          </div>
          <div>
            <p className="font-semibold">{t("unique_cards_drawn")}</p>
            <p>{stats.unique_cards_drawn}</p>
          </div>
          <div>
            <p className="font-semibold">{t("ssr_plus_count")}</p>
            <p>{stats.ssr_plus_count}</p>
          </div>
          <div>
            <p className="font-semibold">{t("longest_drought")}</p>
            <p>{stats.longest_drought}</p>
          </div>
        </div>
        <div>
          <h4 className="font-semibold mb-2">{t("pool_counts")}</h4>
          <ul className="list-disc list-inside">
            {stats.pool_counts &&
              Object.entries(stats.pool_counts).map(([pool, count]) => (
                <li key={pool}>
                  {pool}: {count}
                </li>
              ))}
          </ul>
        </div>
        <div>
          <h4 className="font-semibold mb-2">{t("most_drawn_cards")}</h4>
          <ul className="list-disc list-inside">
            {stats.most_drawn_cards &&
              stats.most_drawn_cards.map((card, index) => (
                <li key={index}>
                  {card.card_name} ({t("rarity")} {card.rarity}):{" "}
                  {card.draw_count} {t("draws")}
                </li>
              ))}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}

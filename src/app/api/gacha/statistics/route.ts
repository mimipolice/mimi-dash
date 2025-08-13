import { NextResponse } from "next/server";
import { auth } from "@/auth";

// --- Translation Maps ---
const rarityMap: { [key: string]: string } = {
  "1": "C",
  "2": "R",
  "3": "SR",
  "4": "SS",
  "5": "UR",
  "6": "LR",
  "7": "EX",
};

// Helper to format numbers with commas
const formatNumber = (num: number | string) =>
  Number(num).toLocaleString("en-US");

interface RawGachaData {
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
    rarity: number;
    card_name: string;
    draw_count: number;
  }[];
  longest_drought: string;
}

export async function GET(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const backendApiUrl = process.env.BACKEND_API_URL;
  const backendApiKey = process.env.BACKEND_API_KEY;

  if (!backendApiUrl || !backendApiKey) {
    console.error("Backend API URL or Key is not configured.");
    return NextResponse.json(
      { error: "Internal Server Error: Service not configured" },
      { status: 500 }
    );
  }

  try {
    const url = new URL(`${backendApiUrl}/api/gacha/statistics`);
    url.searchParams.append("id", userId);

    const { searchParams } = new URL(request.url);
    const poolType = searchParams.get("pool_type");
    if (poolType) {
      url.searchParams.append("pool_type", poolType);
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${backendApiKey}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(
        `Backend API error: ${response.status} ${response.statusText}`,
        errorData
      );
      return NextResponse.json(
        {
          error: "Failed to fetch gacha statistics from backend",
          backendStatus: response.status,
          backendError: errorData,
        },
        { status: response.status }
      );
    }

    const rawApiData: RawGachaData = await response.json();

    // --- Data Transformation ---
    const totalDraws = parseInt(rawApiData.total_draws, 10);

    const transformedData = {
      basic_stats: {
        total_draws: formatNumber(rawApiData.total_draws),
        unique_cards: formatNumber(rawApiData.unique_cards_drawn),
        new_cards: `${formatNumber(rawApiData.new_cards_count)} (${(
          (parseInt(rawApiData.new_cards_count, 10) / totalDraws) *
          100
        ).toFixed(1)}%)`,
        wish_hits: `${formatNumber(rawApiData.wish_cards_count)} (${(
          (parseInt(rawApiData.wish_cards_count, 10) / totalDraws) *
          100
        ).toFixed(1)}%)`,
      },
      rarity_distribution: Object.entries(rawApiData.rarity_counts)
        .map(([id, count]) => ({
          rarity: rarityMap[id] || `Unknown (${id})`,
          count: formatNumber(count as number),
          percentage: `${(((count as number) / totalDraws) * 100).toFixed(2)}%`,
        }))
        .sort((a, b) => {
          const rarityOrder = ["EX", "LR", "UR", "SS", "SR", "R", "C"];
          return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
        }),
      pool_distribution: Object.entries(rawApiData.pool_counts)
        .map(([id, count]) => ({
          pool_key: id, // Pass key for i18n on frontend
          count: formatNumber(count as number),
          percentage: `${(((count as number) / totalDraws) * 100).toFixed(1)}%`,
        }))
        .sort((a, b) => {
          const countA = parseInt(a.count.replace(/,/g, ""), 10);
          const countB = parseInt(b.count.replace(/,/g, ""), 10);
          return countB - countA;
        }),
      luck_analysis: {
        // Placeholder data as it's not in the API response
        avg_top_tier_draw: "1736.2 抽",
        longest_drought: `${formatNumber(rawApiData.longest_drought)} 抽`,
        luck_index: "1.01",
        luck_mood: "平民",
        luck_mood_emoji: "🙂",
      },
      server_comparison: {
        // Placeholder data as it's not in the API response
        top_tier_rate_diff: "比全服平均低 38.5%",
        top_tier_rate_diff_emoji: "😭",
        user_top_tier_rate: "0.058%",
        total_draws_rank: "全服第 3 名",
      },
      most_drawn_cards: rawApiData.most_drawn_cards.map((card) => ({
        card_name: card.card_name,
        rarity_icon: rarityMap[card.rarity.toString()] || `R${card.rarity}`,
        draw_count: formatNumber(card.draw_count),
      })),
    };

    return NextResponse.json(transformedData);
  } catch (error) {
    console.error("Error fetching from backend API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

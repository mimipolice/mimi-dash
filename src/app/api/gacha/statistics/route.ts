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

interface RawGachaData {
  basic_stats: {
    total_draws: number;
    unique_cards_drawn: number;
    new_cards_count: number;
    wish_cards_count: number;
    top_tier_count: number;
  };
  rarity_distribution: {
    rarity: number;
    count: number;
    percentage: number;
  }[];
  pool_distribution: {
    pool_type: string;
    count: number;
    percentage: number;
  }[];
  luck_analysis: {
    avg_draws_per_top_tier: number;
    longest_drought: number;
    luck_index: number;
    luck_rating: {
      key: string;
      emoji: string;
    };
  };
  server_comparison?: {
    user_top_tier_rate: number;
    draw_count_rank: number;
    comparison: {
      rate_diff_percentage: number;
      emoji: string;
    };
  };
  most_drawn_cards: {
    rarity: number;
    card_name: string;
    draw_count: number;
  }[];
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

    // --- Data Transformation for i18n ---
    const {
      basic_stats,
      rarity_distribution,
      pool_distribution,
      luck_analysis,
      server_comparison,
      most_drawn_cards,
    } = rawApiData;

    const totalDraws = basic_stats.total_draws;

    const transformedData = {
      basic_stats: {
        total_draws: basic_stats.total_draws,
        unique_cards: basic_stats.unique_cards_drawn,
        new_cards: {
          count: basic_stats.new_cards_count,
          percentage:
            totalDraws > 0 ? basic_stats.new_cards_count / totalDraws : 0,
        },
        wish_hits: {
          count: basic_stats.wish_cards_count,
          percentage:
            totalDraws > 0 ? basic_stats.wish_cards_count / totalDraws : 0,
        },
      },
      rarity_distribution: rarity_distribution
        .map((item) => ({
          rarity:
            rarityMap[item.rarity.toString()] || `Unknown (${item.rarity})`,
          count: item.count,
          percentage: totalDraws > 0 ? item.count / totalDraws : 0,
        }))
        .sort((a, b) => {
          const rarityOrder = ["EX", "LR", "UR", "SS", "SR", "R", "C"];
          return rarityOrder.indexOf(a.rarity) - rarityOrder.indexOf(b.rarity);
        }),
      pool_distribution: pool_distribution
        .map((item) => ({
          pool_key: item.pool_type,
          count: item.count,
          percentage: totalDraws > 0 ? item.count / totalDraws : 0,
        }))
        .sort((a, b) => b.count - a.count),
      luck_analysis: {
        avg_top_tier_draw: luck_analysis.avg_draws_per_top_tier,
        longest_drought: luck_analysis.longest_drought,
        luck_index: luck_analysis.luck_index,
        luck_mood_key: luck_analysis.luck_rating.key,
        luck_mood_emoji: luck_analysis.luck_rating.emoji,
      },
      server_comparison: server_comparison
        ? {
            rate_diff_percentage:
              server_comparison.comparison.rate_diff_percentage,
            rate_diff_emoji: server_comparison.comparison.emoji,
            user_top_tier_rate: server_comparison.user_top_tier_rate,
            total_draws_rank: server_comparison.draw_count_rank,
          }
        : null,
      most_drawn_cards: most_drawn_cards.map((card) => ({
        card_name: card.card_name,
        rarity_icon: rarityMap[card.rarity.toString()] || `R${card.rarity}`,
        draw_count: card.draw_count,
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

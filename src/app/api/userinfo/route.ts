import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Mock data based on the API documentation
  const mockUserInfo = {
    userinfo: [
      {
        balance: 125075,
        assets: {
          oil_ticket: 1250.75,
          total_card_value: 223178,
          total_stock_value: 10054712,
        },
        main_statistics: {
          total_draw: 123,
          total_game_played: 123,
          card_collection_rate: 70.35,
        },
        addAt: "2025-09-26T10:00:00Z",
      },
    ],
  };

  return NextResponse.json(mockUserInfo);
}

import { NextResponse } from "next/server";

// Mock user data
const users = [
  {
    id: "1",
    name: "Amamiya",
    image: "/images/amamiya.jpg",
    balance: 10000,
    assets: {
      oil_ticket: 10,
      total_card_value: 5000,
      total_stock_value: 20000,
    },
    main_statistics: {
      total_draw: 100,
      total_game_played: 50,
      card_collection_rate: 0.75,
    },
    addAt: "2023-01-15T08:00:00Z",
  },
  {
    id: "2",
    name: "Yuki",
    image: null,
    balance: 500,
    assets: {
      oil_ticket: 2,
      total_card_value: 100,
      total_stock_value: 0,
    },
    main_statistics: {
      total_draw: 10,
      total_game_played: 5,
      card_collection_rate: 0.1,
    },
    addAt: "2023-02-20T10:30:00Z",
  },
];

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const userId = params.userId;
  const user = users.find((u) => u.id === userId);

  if (user) {
    return NextResponse.json(user);
  } else {
    return new NextResponse("User not found", { status: 404 });
  }
}

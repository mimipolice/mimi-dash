import { NextResponse } from "next/server";
import { auth } from "@/auth";

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

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching from backend API:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

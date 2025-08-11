import { NextResponse } from "next/server";
import { auth } from "@/auth";

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  const session = await auth();

  if (!session || !session.user) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  // Allow users to fetch their own history.
  // In a real app, you might also check for an admin role here.
  const awaitedParams = await params;
  if (session.user.id !== awaitedParams.userId) {
    return NextResponse.json(
      { success: false, error: "Forbidden" },
      { status: 403 }
    );
  }

  const { userId } = awaitedParams;

  if (!userId) {
    return NextResponse.json(
      { success: false, error: "User ID is required" },
      { status: 400 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "10";
    const offset = searchParams.get("offset") || "0";

    const backendUrl = new URL(
      `${process.env.BACKEND_API_URL}/api/admin/balance-history/${userId}`
    );
    backendUrl.searchParams.append("limit", limit);
    backendUrl.searchParams.append("offset", offset);

    const response = await fetch(backendUrl.toString(), {
      headers: {
        Authorization: `Bearer ${process.env.BACKEND_API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      try {
        const errorData = JSON.parse(errorText);
        return NextResponse.json(
          {
            success: false,
            error: errorData.error || "Failed to fetch data from backend",
          },
          { status: response.status }
        );
      } catch (e) {
        return NextResponse.json(
          {
            success: false,
            error: "Backend returned non-JSON response",
            details: errorText,
          },
          { status: response.status }
        );
      }
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Error fetching from backend API:", {
      message: error.message,
      stack: error.stack,
      cause: error.cause,
    });
    return NextResponse.json(
      {
        success: false,
        error: "Internal Server Error",
        details: error.message,
      },
      { status: 500 }
    );
  }
}

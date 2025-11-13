import { NextRequest, NextResponse } from "next/server";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  try {
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/announcements/${id}/view`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.BACKEND_API_KEY!}`,
          "X-Forwarded-For":
            request.headers.get("x-forwarded-for") ||
            request.headers.get("x-real-ip") ||
            "",
        },
      }
    );

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to record announcement view:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to record view", status: 500 },
      },
      { status: 500 }
    );
  }
}

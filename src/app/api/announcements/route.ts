import { NextResponse } from "next/server";
export async function GET() {
  try {
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/announcements`,
      {
        headers: {
          Authorization: `Bearer ${process.env.BACKEND_API_KEY!}`,
        },
      }
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch announcements:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to fetch announcements", status: 500 },
      },
      { status: 500 }
    );
  }
}

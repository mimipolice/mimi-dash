import { NextResponse } from "next/server";
export async function GET() {
  try {
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/banners/active`,
      {
        headers: {
          Authorization: `Bearer ${process.env.BACKEND_API_KEY!}`,
        },
      }
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch active banners:", error);
    return NextResponse.json(
      { error: "Failed to fetch active banners" },
      { status: 500 }
    );
  }
}

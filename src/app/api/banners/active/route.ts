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
    return NextResponse.json({ success: true, data: data.data });
  } catch (error) {
    console.error("Failed to fetch active banners:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to fetch active banners", status: 500 },
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { checkAdmin } from "@/lib/auth-utils";

export async function GET(req: NextRequest) {
  const unauthorizedResponse = await checkAdmin();
  if (unauthorizedResponse) return unauthorizedResponse;

  try {
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/admin/announcements`,
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

export async function POST(req: NextRequest) {
  const unauthorizedResponse = await checkAdmin();
  if (unauthorizedResponse) return unauthorizedResponse;

  try {
    const body = await req.json();
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/admin/announcements`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.BACKEND_API_KEY!}`,
        },
        body: JSON.stringify(body),
      }
    );
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to create announcement:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to create announcement", status: 500 },
      },
      { status: 500 }
    );
  }
}

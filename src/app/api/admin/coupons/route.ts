import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";

async function checkAdmin() {
  const session = await auth();
  const adminIds = (process.env.ADMIN_DISCORD_ID || "").split(",");
  if (!session?.user?.id || !adminIds.includes(session.user.id)) {
    return NextResponse.json(
      { success: false, error: { message: "Unauthorized", status: 401 } },
      { status: 401 }
    );
  }
  return null;
}

// GET /api/admin/coupons
export async function GET(req: NextRequest) {
  const unauthorizedResponse = await checkAdmin();
  if (unauthorizedResponse) return unauthorizedResponse;

  try {
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/admin/coupons`,
      {
        headers: {
          Authorization: `Bearer ${process.env.BACKEND_API_KEY!}`,
        },
      }
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch coupons:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to fetch coupons", status: 500 },
      },
      { status: 500 }
    );
  }
}

// POST /api/admin/coupons
export async function POST(req: NextRequest) {
  const unauthorizedResponse = await checkAdmin();
  if (unauthorizedResponse) return unauthorizedResponse;

  try {
    const body = await req.json();
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/admin/coupons`,
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
    console.error("Failed to create coupon:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to create coupon", status: 500 },
      },
      { status: 500 }
    );
  }
}

// PUT /api/admin/coupons
export async function PUT(req: NextRequest) {
  const unauthorizedResponse = await checkAdmin();
  if (unauthorizedResponse) return unauthorizedResponse;

  try {
    const body = await req.json();
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/admin/coupons`,
      {
        method: "PUT",
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
    console.error("Failed to update coupon:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to update coupon", status: 500 },
      },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from "next/server";
import { checkAdmin } from "@/lib/auth-utils";

export async function GET(req: NextRequest, { params }: any) {
  const unauthorizedResponse = await checkAdmin();
  if (unauthorizedResponse) return unauthorizedResponse;

  try {
    const id = params.id;
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/admin/coupons/${id}/usage`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${process.env.BACKEND_API_KEY!}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return NextResponse.json(errorData, { status: response.status });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to fetch coupon usage:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to fetch coupon usage", status: 500 },
      },
      { status: 500 }
    );
  }
}

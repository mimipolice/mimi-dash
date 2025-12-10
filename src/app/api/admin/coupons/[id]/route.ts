import { NextRequest, NextResponse } from "next/server";
import { checkAdmin } from "@/lib/auth-utils";

export async function DELETE(req: NextRequest, { params }: any) {
  const unauthorizedResponse = await checkAdmin();
  if (unauthorizedResponse) return unauthorizedResponse;

  try {
    const id = params.id;
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/admin/coupons/${id}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${process.env.BACKEND_API_KEY!}`,
        },
      }
    );
    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error("Failed to delete coupon:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to delete coupon", status: 500 },
      },
      { status: 500 }
    );
  }
}

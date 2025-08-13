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

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const unauthorizedResponse = await checkAdmin();
  if (unauthorizedResponse) return unauthorizedResponse;

  try {
    const id = params.id;
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/admin/coupons/${id}`,
      {
        method: "DELETE",
        headers: {
          "X-Mimi-Api-Token": process.env.BACKEND_API_KEY!,
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

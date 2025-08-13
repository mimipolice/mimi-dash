import { NextRequest, NextResponse } from "next/server";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const apiToken = req.headers.get("X-Mimi-Api-Token");
  if (!apiToken || apiToken !== process.env.BACKEND_API_KEY) {
    return NextResponse.json(
      { success: false, error: { message: "Unauthorized", status: 401 } },
      { status: 401 }
    );
  }

  try {
    const id = params.id;
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/admin/coupons/${id}`,
      {
        method: "DELETE",
        headers: {
          "X-Mimi-Api-Token": apiToken,
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

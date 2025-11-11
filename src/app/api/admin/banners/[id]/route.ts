import { NextRequest, NextResponse } from "next/server";
import { checkAdmin } from "@/lib/auth-utils";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorizedResponse = await checkAdmin();
  if (unauthorizedResponse) return unauthorizedResponse;

  try {
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/admin/banners/${(await params).id}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.BACKEND_API_KEY!}`,
        },
      }
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch banner:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to fetch banner", status: 500 },
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorizedResponse = await checkAdmin();
  if (unauthorizedResponse) return unauthorizedResponse;

  try {
    const body = await req.json();
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/admin/banners/${(await params).id}`,
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
    console.error("Failed to update banner:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to update banner", status: 500 },
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const unauthorizedResponse = await checkAdmin();
  if (unauthorizedResponse) return unauthorizedResponse;

  try {
    const response = await fetch(
      `${process.env.BACKEND_API_URL}/api/admin/banners/${(await params).id}`,
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
    console.error("Failed to delete banner:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to delete banner", status: 500 },
      },
      { status: 500 }
    );
  }
}

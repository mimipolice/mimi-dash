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
      `${process.env.BACKEND_API_URL}/api/admin/announcements/${
        (
          await params
        ).id
      }`,
      {
        headers: {
          Authorization: `Bearer ${process.env.BACKEND_API_KEY!}`,
        },
      }
    );
    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error("Failed to fetch announcement:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to fetch announcement", status: 500 },
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
      `${process.env.BACKEND_API_URL}/api/admin/announcements/${
        (
          await params
        ).id
      }`,
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
    console.error("Failed to update announcement:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to update announcement", status: 500 },
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
      `${process.env.BACKEND_API_URL}/api/admin/announcements/${
        (
          await params
        ).id
      }`,
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
    console.error("Failed to delete announcement:", error);
    return NextResponse.json(
      {
        success: false,
        error: { message: "Failed to delete announcement", status: 500 },
      },
      { status: 500 }
    );
  }
}

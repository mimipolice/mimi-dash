import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = session.user;
    const { to, coins } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    if (!to) {
      return NextResponse.json(
        { error: "Missing recipient Discord ID" },
        { status: 400 }
      );
    }

    if (id === to) {
      return NextResponse.json(
        { status: "error", errors: ["Same user transfer is not allowed"] },
        { status: 400 }
      );
    }

    if (!coins || typeof coins !== "number" || coins <= 0) {
      return NextResponse.json(
        { error: "Invalid transfer amount" },
        { status: 400 }
      );
    }

    const apiKey = process.env.BACKEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const baseUrl = (process.env.BACKEND_API_URL as string).replace(/\/$/, "");
    const finalUrl = `${baseUrl}/api/admin/transfer`;

    const response = await axios.post(
      finalUrl,
      {
        sender_id: id,
        receiver_id: to,
        amount: coins,
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-Mimi-Api-Token": apiKey,
        },
      }
    );

    return NextResponse.json(response.data);
  } catch (error) {
    // In a real-world application, you might want to log this error to a service
    // For now, we just forward the error response

    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(error.response.data, {
        status: error.response.status,
      });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

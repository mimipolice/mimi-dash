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
        { message: "Cannot transfer to yourself" },
        { status: 400 }
      );
    }

    if (!coins || typeof coins !== "number" || coins <= 0 || !Number.isFinite(coins)) {
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
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    // Forward rate limit headers from backend
    const headers: Record<string, string> = {};
    const rateLimitHeaders = [
      "X-RateLimit-Limit",
      "X-RateLimit-Remaining",
      "X-RateLimit-Reset",
    ];
    rateLimitHeaders.forEach((header) => {
      const value = response.headers[header.toLowerCase()];
      if (value) {
        headers[header] = value;
      }
    });

    return NextResponse.json(response.data, { headers });
  } catch (error) {
    if (axios.isAxiosError(error) && error.response) {
      // Forward rate limit headers on error responses too
      const headers: Record<string, string> = {};
      const rateLimitHeaders = [
        "X-RateLimit-Limit",
        "X-RateLimit-Remaining",
        "X-RateLimit-Reset",
        "Retry-After",
      ];
      rateLimitHeaders.forEach((header) => {
        const value = error.response?.headers[header.toLowerCase()];
        if (value) {
          headers[header] = value;
        }
      });

      return NextResponse.json(error.response.data, {
        status: error.response.status,
        headers,
      });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

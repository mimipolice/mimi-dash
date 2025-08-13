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
    const { code } = await request.json();

    if (!id) {
      return NextResponse.json({ error: "Missing user ID" }, { status: 400 });
    }

    if (!code) {
      return NextResponse.json(
        { error: "Missing coupon code" },
        { status: 400 }
      );
    }

    console.log(`Redeeming code '${code}' for user '${id}'`);

    const apiKey = process.env.BACKEND_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }

    const apiUrl = new URL(process.env.BACKEND_API_URL as string);
    apiUrl.pathname = "/api/redeem";

    const response = await axios.post(
      apiUrl.toString(),
      {
        code: code,
        userId: id,
      },
      {
        headers: {
          "X-User-ID": id,
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
      }
    );

    // The backend responded with a 2xx status.
    // Now, check the business logic success flag.
    if (response.data.success === false) {
      // Business logic failure. The backend should have sent a non-2xx code,
      // but let's handle it here to be robust.
      // Use the status from the error payload, or default to 400.
      const status = response.data.error?.status || 400;
      return NextResponse.json(response.data, { status });
    }

    // Business logic success.
    return NextResponse.json(response.data, { status: response.status });
  } catch (error) {
    console.error("Error redeeming coupon:", error);

    if (axios.isAxiosError(error)) {
      const status = error.response?.status || 500;
      const data = error.response?.data || { error: "Unknown error" };

      return NextResponse.json(data, { status });
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

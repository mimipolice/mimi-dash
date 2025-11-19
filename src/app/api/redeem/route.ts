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

    const safeCode = JSON.stringify(code);
    console.log(`Redeeming code ${safeCode} for user '${id}'`);
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
    // The backend responded with a 2xx status.
    // Now, we robustly check the business logic success flag.
    const responseData = response.data;
    // According to the documentation, any valid response (success or error)
    // should contain a 'message' field. An empty object {} is invalid.
    if (!responseData || !responseData.message) {
      console.error("Invalid response from backend API:", responseData);
      return NextResponse.json(
        { error: "Invalid response from the backend service." },
        { status: 500 }
      );
    }

    if (
      responseData.success === false ||
      responseData.status === "error" ||
      responseData.errors
    ) {
      // Business logic failure. The backend should have sent a non-2xx code,
      // but we handle it here to be robust.
      // Use the status from the error payload, or default to 400.
      const status = responseData.error?.status || 400;
      return NextResponse.json(responseData, { status });
    }

    // Business logic success.
    return NextResponse.json(responseData, { status: response.status });
  } catch (error) {
    console.error("Error redeeming coupon:", error);

    if (axios.isAxiosError(error)) {
      // The backend responded with a non-2xx status code.
      const status = error.response?.status || 500;
      const data = error.response?.data || {
        error: "An unknown error occurred",
      };
      return NextResponse.json(data, { status });
    }

    // Catch-all for non-Axios errors.
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

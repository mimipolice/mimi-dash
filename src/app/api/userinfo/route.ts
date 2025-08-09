import { auth } from "@/auth";
import { NextRequest, NextResponse } from "next/server";
import axios from "axios";

export async function GET(request: NextRequest) {
  // This route is temporarily disabled.
  // We are now fetching user data directly from the Discord provider.
  return NextResponse.json({});
}

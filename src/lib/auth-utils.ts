import { NextResponse } from "next/server";
import { auth } from "@/auth";
import appConfig from "@/config";

export async function checkAdmin() {
  const session = await auth();
  const adminIds = appConfig.admins.map((admin) => admin.id);

  if (!session?.user?.id || !adminIds.includes(session.user.id)) {
    return NextResponse.json(
      { success: false, error: { message: "Unauthorized", status: 401 } },
      { status: 401 }
    );
  }
  return null;
}

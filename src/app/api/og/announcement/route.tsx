import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return new Response("Missing announcement ID", { status: 400 });
    }

    // Fetch announcement data from backend
    const backendUrl = process.env.BACKEND_API_URL;
    const apiKey = process.env.BACKEND_API_KEY;

    if (!backendUrl || !apiKey) {
      console.error("Missing BACKEND_API_URL or BACKEND_API_KEY");
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      return Response.redirect(`${baseUrl}/OG/Murasame_25-10-9.jpg`, 302);
    }

    const response = await fetch(`${backendUrl}/api/announcements`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    if (!response.ok) {
      console.error(`Failed to fetch announcements: ${response.status}`);
      // 返回預設圖片
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      return Response.redirect(`${baseUrl}/OG/Murasame_25-10-9.jpg`, 302);
    }

    const announcements = await response.json();
    const announcement = announcements.find(
      (a: { id: number }) => a.id.toString() === id
    );

    if (!announcement) {
      console.warn(`Announcement ${id} not found`);
      // 返回預設圖片
      const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
      return Response.redirect(`${baseUrl}/OG/Murasame_25-10-9.jpg`, 302);
    }

    // 優先使用後端圖片，否則使用預設圖片
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    const imageUrl =
      announcement.image_url || `${baseUrl}/OG/Murasame_25-10-9.jpg`;

    // 直接重定向到圖片
    return Response.redirect(imageUrl, 302);
  } catch (error) {
    console.error("Error generating OG image:", error);

    // 錯誤時返回預設圖片
    const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
    return Response.redirect(`${baseUrl}/OG/Murasame_25-10-9.jpg`, 302);
  }
}

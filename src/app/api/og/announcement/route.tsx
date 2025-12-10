import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(request: NextRequest) {
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const defaultImage = `${baseUrl}/OG/Murasame_25-10-9.jpg`;

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      console.error("[OG] Missing announcement ID");
      return Response.redirect(defaultImage, 302);
    }

    console.log(`[OG] Fetching announcement ${id}`);

    // Fetch announcement data from backend
    const backendUrl = process.env.BACKEND_API_URL;
    const apiKey = process.env.BACKEND_API_KEY;

    if (!backendUrl || !apiKey) {
      console.error("[OG] Missing BACKEND_API_URL or BACKEND_API_KEY");
      return Response.redirect(defaultImage, 302);
    }

    console.log(`[OG] Fetching from ${backendUrl}/api/announcements`);

    const response = await fetch(`${backendUrl}/api/announcements`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
      cache: "no-store",
    });

    if (!response.ok) {
      console.error(`[OG] Failed to fetch announcements: ${response.status}`);
      return Response.redirect(defaultImage, 302);
    }

    const data = await response.json();

    // 處理不同的響應格式
    let announcements: any[];
    if (Array.isArray(data)) {
      announcements = data;
    } else if (data.data && Array.isArray(data.data)) {
      announcements = data.data;
    } else if (data.announcements && Array.isArray(data.announcements)) {
      announcements = data.announcements;
    } else {
      console.error(
        `[OG] Unexpected response format:`,
        typeof data,
        JSON.stringify(data).substring(0, 200)
      );
      return Response.redirect(defaultImage, 302);
    }

    console.log(`[OG] Found ${announcements.length} announcements`);

    const announcement = announcements.find(
      (a: { id: number }) => a.id.toString() === id
    );

    if (!announcement) {
      console.warn(`[OG] Announcement ${id} not found in list`);
      return Response.redirect(defaultImage, 302);
    }

    console.log(
      `[OG] Found announcement ${id}, has image: ${!!announcement.image_url}`
    );

    // 如果有圖片，檢查格式；否則使用預設圖片
    if (announcement.image_url) {
      // 將相對路徑轉換成完整 URL
      let imageUrl = announcement.image_url;
      if (imageUrl.startsWith("/")) {
        imageUrl = `${baseUrl}${imageUrl}`;
      }

      // 檢查是否為 WebP 格式（Discord 可能不支援）
      const isWebP = imageUrl.toLowerCase().endsWith(".webp");

      if (isWebP) {
        console.log(
          `[OG] Image is WebP format, using default image instead: ${imageUrl}`
        );
        return Response.redirect(defaultImage, 302);
      }

      console.log(`[OG] Using announcement image: ${imageUrl}`);
      return Response.redirect(imageUrl, 302);
    }

    // 沒有圖片時使用預設圖片
    console.log(`[OG] No image, using default`);
    return Response.redirect(defaultImage, 302);
  } catch (error) {
    console.error("[OG] Error generating OG image:", error);
    return Response.redirect(defaultImage, 302);
  }
}

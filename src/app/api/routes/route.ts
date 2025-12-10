import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const excludedRoutes = ["/api", "/auth", "/go", "/old"];
function getRoutes(
  dir: string,
  prefix = ""
): { label: string; value: string }[] {
  const files = fs.readdirSync(dir);
  let routes: { label: string; value: string }[] = [];
  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const routePath = `${prefix}/${file.replace(/\..*$/, "")}`;

    if (excludedRoutes.some((route) => routePath.startsWith(route))) {
      return;
    }

    if (stat.isDirectory()) {
      routes = routes.concat(getRoutes(filePath, routePath));
    } else if (file.match(/\.(tsx|mdx)$/) && !file.startsWith("_")) {
      const route =
        routePath.replace(/\/page$/, "").replace(/\/index$/, "") || "/";
      routes.push({ label: route, value: route });
    }
  });

  return routes;
}

export async function GET() {
  const routes = getRoutes(path.join(process.cwd(), "src/app"));
  
  // 添加常用路由（確保這些路由一定存在）
  const commonRoutes = [
    { label: "/announcements", value: "/announcements" },
    { label: "/dashboard", value: "/dashboard" },
    { label: "/docs", value: "/docs" },
    { label: "/docs/terms", value: "/docs/terms" },
    { label: "/docs/privacy", value: "/docs/privacy" },
    { label: "/docs/community", value: "/docs/community" },
  ];
  
  // 合併並去重
  const allRoutes = [...commonRoutes, ...routes];
  const uniqueRoutes = Array.from(
    new Map(allRoutes.map((r) => [r.value, r])).values()
  );
  
  // 排序
  uniqueRoutes.sort((a, b) => a.value.localeCompare(b.value));
  
  return NextResponse.json({ success: true, data: uniqueRoutes });
}

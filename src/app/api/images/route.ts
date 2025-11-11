import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

function getImageRoutes(
  dir: string,
  prefix = ""
): { label: string; value: string }[] {
  const files = fs.readdirSync(dir);
  let routes: { label: string; value: string }[] = [];

  files.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    const routePath = `${prefix}/${file}`;

    if (stat.isDirectory()) {
      routes = routes.concat(getImageRoutes(filePath, routePath));
    } else if (file.match(/\.(png|jpg|jpeg|webp|svg)$/)) {
      routes.push({ label: routePath, value: routePath });
    }
  });

  return routes;
}

export async function GET() {
  const routes = getImageRoutes(
    path.join(process.cwd(), "public/images"),
    "/images"
  );
  return NextResponse.json({ success: true, data: routes });
}

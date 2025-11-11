import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export interface DocumentMetadata {
  title: string;
  titleEn: string;
  description: string;
  descriptionEn: string;
  icon: string;
  color: string;
  lastUpdated: string;
  category: string;
  order: number;
  slug: string;
}

export async function GET() {
  const documents: DocumentMetadata[] = [];

  try {
    const docsPath = path.join(process.cwd(), "src/app/docs");

    if (!fs.existsSync(docsPath)) {
      console.warn("Docs directory not found:", docsPath);
      return NextResponse.json({ success: true, data: [] });
    }

    const entries = fs.readdirSync(docsPath, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const mdxPath = path.join(docsPath, entry.name, "page.mdx");
      if (!fs.existsSync(mdxPath)) {
        continue;
      }

      try {
        const mdxModule = await import(`@/app/docs/${entry.name}/page.mdx`);
        if (mdxModule.frontmatter) {
          const frontmatter = mdxModule.frontmatter;
          documents.push({
            slug: entry.name,
            title: frontmatter.title || entry.name,
            titleEn: frontmatter.titleEn || frontmatter.title || entry.name,
            description: frontmatter.description || "",
            descriptionEn:
              frontmatter.descriptionEn || frontmatter.description || "",
            icon: frontmatter.icon || "FileText",
            color: frontmatter.color || "blue",
            lastUpdated:
              frontmatter.lastUpdated || new Date().toISOString().split("T"),
            category: frontmatter.category || "Document",
            order: frontmatter.order || 999,
          });
        }
      } catch (importError) {
        console.error(
          `Failed to import or process frontmatter for ${entry.name}:`,
          importError
        );
      }
    }

    const sortedDocuments = documents.sort((a, b) => a.order - b.order);
    return NextResponse.json({ success: true, data: sortedDocuments });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "An unknown error occurred";
    console.error("Failed to read docs directory:", error);
    return NextResponse.json(
      { success: false, error: { message, status: 500 } },
      { status: 500 }
    );
  }
}

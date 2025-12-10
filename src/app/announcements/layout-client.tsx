"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Rss } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function AnnouncementsLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("announcements");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted">
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        <div className="mb-6">
          <Button asChild variant="ghost" className="gap-2 hover:bg-primary/10">
            <Link href="/dashboard">
              <ArrowLeft className="w-4 h-4" />
              {t("backToDashboard")}
            </Link>
          </Button>
        </div>

        <Card className="mb-8 border-primary/30 bg-gradient-to-r from-primary/10 via-primary/5 to-background shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/20 border border-primary/30">
                  <Rss className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-foreground mb-1">
                    {t("title")}
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    {t("subtitle")}
                  </CardDescription>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        <div className="space-y-6">{children}</div>

        <div className="mt-8 text-center text-sm text-muted-foreground">
          <p>{t("copyright")}</p>
        </div>
      </div>
    </div>
  );
}

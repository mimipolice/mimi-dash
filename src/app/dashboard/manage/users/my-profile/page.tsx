"use client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { useTranslations } from "next-intl";
import { UserCard } from "@/components/user-card";
import { AdCard } from "@/components/ad-card";
import { BalanceHistoryList } from "@/components/balance-history-list";
import { GachaStatisticsCard } from "@/components/gacha-statistics-card";

export default function UserProfilePage() {
  const t = useTranslations("dashboard");
  const common = useTranslations("common");

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">
                  {common("dashboard")}
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>{t("manage.my-profile")}</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="p-6 flex">
        <div className="flex flex-wrap gap-10 items-start">
          <div>
            <UserCard />
          </div>
          <div>
            <GachaStatisticsCard />
          </div>
          <div>
            <BalanceHistoryList />
          </div>
        </div>
      </div>
    </>
  );
}

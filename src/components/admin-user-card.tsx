"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { User, Droplets, Server } from "lucide-react";
import { useTranslations } from "next-intl";

// A simplified UserInfo interface for the admin page
export interface UserInfo {
  id: string;
  name: string;
  image?: string | null;
  balance: number;
  serverCount: number;
}

interface AdminUserCardProps {
  user: UserInfo;
}

export function AdminUserCard({ user }: AdminUserCardProps) {
  const t = useTranslations("userCard");

  return (
    <Card className="w-full max-w-md mx-auto h-full flex flex-col">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-base">
          <User className="h-5 w-5 text-blue-500" />
          {t("title", { defaultValue: "User Information" })}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 flex-grow flex flex-col">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarImage src={user.image || ""} alt={user.name || "User"} />
            <AvatarFallback className="text-lg">
              {user.name?.charAt(0)?.toUpperCase() || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 space-y-1">
            <h3 className="font-semibold text-md leading-none">
              {user.name || t("unknownUser", { defaultValue: "Unknown User" })}
            </h3>
            <p className="text-xs text-muted-foreground">
              ID: {user.id || t("unknownId", { defaultValue: "Unknown" })}
            </p>
          </div>
        </div>

        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Droplets className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">
                {t("droplets", { defaultValue: "Droplets" })}
              </span>
            </div>
            <Badge
              variant="secondary"
              className="bg-blue-500/10 text-blue-700 dark:text-blue-300"
            >
              {user.balance.toLocaleString()}
            </Badge>
          </div>
        </div>

        <div className="border-t pt-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-emerald-500" />
              <span className="text-sm font-medium">
                {t("servers", { defaultValue: "Servers" })}
              </span>
            </div>
            <Badge
              variant="secondary"
              className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
            >
              {user.serverCount}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

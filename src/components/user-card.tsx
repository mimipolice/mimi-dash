"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  User,
  Droplets,
  Server,
  ExternalLink,
  Copy,
  Library,
  BarChart,
} from "lucide-react";
import { useSession } from "next-auth/react";
import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

interface UserInfo {
  id: string;
  name: string;
  balance: number;
  assets: {
    oil_ticket: number;
    total_card_value: number;
    total_stock_value: number;
  };
  main_statistics: {
    total_draw: number;
    total_game_played: number;
    card_collection_rate: number;
  };
  addAt: string;
}

export function UserCard() {
  const { data: session } = useSession();
  const t = useTranslations("userCard");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedUserId, setCopiedUserId] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        const response = await axios.get("/api/userinfo");
        setUserInfo(response.data);
      } catch (error) {
        console.error("Failed to fetch user info:", error);
      } finally {
        setLoading(false);
      }
    };

    if (session?.user) {
      fetchUserInfo();
    }
  }, [session]);

  const copyUserIdToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(
        "https://www.youtube.com/watch?v=ymYFqNUt05g"
      );
      setCopiedUserId(true);
      setTimeout(() => setCopiedUserId(false), 2000);
    } catch (error) {
      console.error("Failed to copy user ID to clipboard:", error);
    }
  };

  if (!session?.user) {
    return null;
  }

  const { user } = session;

  return (
    <motion.div
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="h-full"
    >
      <Card className="w-full max-w-md mx-auto h-full flex flex-col">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-500" />
            {t("title", { defaultValue: "用戶資訊" })}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 flex-grow flex flex-col">
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src={user.image || ""} alt={user.name || "User"} />
              <AvatarFallback className="text-lg">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <h3 className="font-semibold text-lg leading-none">
                {user.name || t("unknownUser", { defaultValue: "未知用戶" })}
              </h3>
              <div className="">
                <p className="text-sm text-muted-foreground">
                  Discord ID:{" "}
                  {user.id || t("unknownId", { defaultValue: "未知" })}
                </p>
              </div>
            </div>
          </div>

          <div className="border-t pt-4">
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
                {loading ? "..." : userInfo?.balance?.toLocaleString() || "0"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("dropletsDescription", {
                defaultValue: "您的貨幣餘額",
                balance: userInfo?.balance || 0,
              })}
            </p>
          </div>

          <div className="border-t pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Server className="h-4 w-4 text-emerald-500" />
                <span className="text-sm font-medium">
                  {t("servers", { defaultValue: "伺服器" })}
                </span>
              </div>
              <Badge
                variant="secondary"
                className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"
              >
                {loading ? "..." : "N/A"}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("serversDescription", {
                defaultValue: "您目前擁有的伺服器數量",
                count: "N/A",
              })}
            </p>
          </div>

          <AnimatePresence>
            {isHovered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Library className="h-4 w-4 text-orange-500" />
                      <span className="text-sm font-medium">{t("assets")}</span>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground pl-6">
                    <p>
                      {t("oilTicket")}:{" "}
                      {loading
                        ? "..."
                        : userInfo?.assets?.oil_ticket.toLocaleString()}
                    </p>
                    <p>
                      {t("totalCardValue")}:{" "}
                      {loading
                        ? "..."
                        : userInfo?.assets?.total_card_value.toLocaleString()}
                    </p>
                    <p>
                      {t("totalStockValue")}:{" "}
                      {loading
                        ? "..."
                        : userInfo?.assets?.total_stock_value.toLocaleString()}
                    </p>
                  </div>
                </div>
                <br />
                <div className="border-t pt-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <BarChart className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">
                        {t("statistics")}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-1 text-xs text-muted-foreground pl-6">
                    <p>
                      {t("totalDraw")}:{" "}
                      {loading
                        ? "..."
                        : userInfo?.main_statistics?.total_draw.toLocaleString()}
                    </p>
                    <p>
                      {t("totalGamePlayed")}:{" "}
                      {loading
                        ? "..."
                        : userInfo?.main_statistics?.total_game_played.toLocaleString()}
                    </p>
                    <p>
                      {t("cardCollectionRate")}:{" "}
                      {loading
                        ? "..."
                        : `${userInfo?.main_statistics?.card_collection_rate}%`}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="border-t pt-4 mt-auto">
            <div className="grid grid-cols-1 gap-2">
              <Button
                variant="default"
                size="sm"
                className="w-full bg-gradient-to-r from-blue-400 to-blue-700 hover:from-blue-600 hover:to-blue-700 text-white"
                onClick={() => window.open("/go/panel", "_blank")}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                {t("goToPanel", { defaultValue: "前往面板" })}
              </Button>
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={copyUserIdToClipboard}
                disabled={copiedUserId}
              >
                <Copy className="h-4 w-4 mr-2" />
                {copiedUserId
                  ? t("copied", { defaultValue: "已複製" })
                  : t("copyUserId", { defaultValue: "複製 ID?" })}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

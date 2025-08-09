"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";
import useSWR from "swr";

interface UserInfoData {
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

interface UserInfo {
  userinfo: UserInfoData[];
}

const fetcher = (url: string) => fetch(url).then((res) => res.json());

export function UserCard() {
  const { data: session } = useSession();
  const { data: userInfo, error } = useSWR<UserInfo>("/api/userinfo", fetcher);
  const [copiedUserId, setCopiedUserId] = useState(false);

  const copyUserIdToClipboard = async () => {
    try {
      if (session?.user?.id) {
        await navigator.clipboard.writeText(session.user.id);
        setCopiedUserId(true);
        setTimeout(() => setCopiedUserId(false), 2000);
      }
    } catch (error) {
      console.error("Failed to copy user ID to clipboard:", error);
    }
  };

  if (!session?.user) {
    return null;
  }

  const { user } = session;
  // @ts-expect-error -- banner is a custom property
  const bannerUrl = user.banner;

  const renderUserInfo = () => {
    if (error) return <div>無法載入使用者資訊</div>;
    if (!userInfo) return <div>載入中...</div>;

    const userData = userInfo.userinfo?.[0];

    if (!userData) return <div>沒有可用的使用者資訊</div>;

    return (
      <>
        <p className="text-sm text-muted-foreground">
          油幣餘額: {userData.balance.toLocaleString()}
        </p>
        <p className="text-sm text-muted-foreground">
          油票: {userData.assets.oil_ticket.toLocaleString()}
        </p>
      </>
    );
  };

  return (
    <Card className="w-full max-w-md overflow-hidden transition-all duration-300 ease-in-out hover:shadow-2xl hover:-translate-y-1">
      {bannerUrl && (
        <div className="relative">
          <img
            src={bannerUrl}
            alt="User Banner"
            className="w-full h-32 object-cover"
          />
          <div className="absolute bottom-0 left-4 transform translate-y-1/2">
            <Avatar className="h-24 w-24 border-4 border-background transition-transform duration-300 ease-in-out hover:scale-110">
              <AvatarImage src={user.image || ""} alt={user.name || "User"} />
              <AvatarFallback className="text-2xl">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      )}
      <CardHeader className={`pb-4 ${bannerUrl ? "pt-16" : ""}`}>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5 text-blue-500" />
          用戶資訊
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!bannerUrl && (
          <div className="flex items-center space-x-4">
            <Avatar className="h-16 w-16 transition-transform duration-300 ease-in-out hover:scale-110">
              <AvatarImage src={user.image || ""} alt={user.name || "User"} />
              <AvatarFallback className="text-lg">
                {user.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <h3 className="font-semibold text-lg leading-none">
                {user.name || "未知用戶"}
              </h3>
              <p className="text-sm text-muted-foreground">
                {user.email || "No email"}
              </p>
            </div>
          </div>
        )}

        {bannerUrl && (
          <div className="flex-1 space-y-1 pt-2">
            <h3 className="font-semibold text-2xl leading-none">
              {user.name || "未知用戶"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {user.email || "No email"}
            </p>
          </div>
        )}

        <div className="border-t pt-4 space-y-2">
          <p className="text-sm text-muted-foreground">
            Discord ID: {user.id || "未知"}
          </p>
          {renderUserInfo()}
        </div>
      </CardContent>
    </Card>
  );
}

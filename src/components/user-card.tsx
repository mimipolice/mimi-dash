"use client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
import { useSession } from "next-auth/react";
import { useState } from "react";

interface UserInfo {
  coins: number;
  panelId: number;
  servers: Array<{
    id: number;
    identifier: string;
    status: string;
    resources: {
      cpu: number;
      ram: number;
      disk: number;
      databases: number;
      allocations: number;
      backups: number;
    };
    expireAt: string;
    autoRenew: boolean;
    createAt: string;
    _id: string;
  }>;
}

export function UserCard() {
  const { data: session } = useSession();
  const [copiedUserId, setCopiedUserId] = useState(false);

  const copyUserIdToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(user.id || "");
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
  // @ts-expect-error -- banner is a custom property
  const bannerUrl = user.banner;

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

        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground">
            Discord ID: {user.id || "未知"}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

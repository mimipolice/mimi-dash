"use client";

import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownLeft, Wallet } from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import axios from "axios";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

import { Button } from "@/components/ui/button";

interface BalanceHistoryItem {
  id: number;
  user_id: string;
  change_amount: number;
  balance_before: number;
  balance_after: number;
  transaction_type: string;
  reason: string;
  created_at: string;
}

interface Pagination {
  total: number;
  limit: number;
  offset: number;
}

export function BalanceHistoryList({
  className,
  userId,
}: {
  className?: string;
  userId?: string;
}) {
  const t = useTranslations("dashboard.balance-history");
  const [history, setHistory] = useState<BalanceHistoryItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const { data: session } = useSession();
  const itemsPerPage = 6;

  const fetchHistory = useCallback(
    async (page: number) => {
      const targetUserId = userId || session?.user?.id;
      if (!targetUserId) return;

      setLoading(true);
      try {
        const response = await axios.get(
          `/api/admin/balance-history/${targetUserId}`,
          {
            params: { limit: itemsPerPage, offset: page * itemsPerPage },
          }
        );
        if (response.data.success) {
          setHistory(response.data.data);
          setPagination(response.data.pagination);
        } else {
          toast.error(t("fetch-error"));
        }
      } catch (error) {
        toast.error(t("fetch-error"));
        console.error("Failed to fetch balance history:", error);
      } finally {
        setLoading(false);
      }
    },
    [userId, session, itemsPerPage, t]
  );

  useEffect(() => {
    const targetUserId = userId || session?.user?.id;
    if (targetUserId) {
      fetchHistory(currentPage);
    } else if (session === null && !userId) {
      setLoading(false);
    }
  }, [session, userId, currentPage, fetchHistory]);

  const getIcon = (item: BalanceHistoryItem) => {
    if (item.change_amount > 0) {
      return (
        <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
          <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
        </div>
      );
    }
    if (item.change_amount < 0) {
      return (
        <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/30">
          <ArrowDownLeft className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
        </div>
      );
    }
    return (
      <div className="p-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800">
        <Wallet className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
      </div>
    );
  };

  if (!session && !loading) {
    return null; // Don't render if not logged in
  }

  return (
    <div
      className={cn(
        "w-full",
        "bg-white dark:bg-zinc-900/70",
        "border border-zinc-100 dark:border-zinc-800",
        "rounded-xl shadow-sm backdrop-blur-xl",
        className
      )}
    >
      <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
          {t("title")}
        </h1>
      </div>

      <div className="p-3">
        {loading ? (
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="flex items-center justify-between p-2 animate-pulse"
              >
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-zinc-100 dark:bg-zinc-800" />
                  <div>
                    <div className="h-4 w-24 rounded bg-zinc-100 dark:bg-zinc-800" />
                    <div className="h-3 w-32 mt-1 rounded bg-zinc-100 dark:bg-zinc-800" />
                  </div>
                </div>
                <div className="h-4 w-16 rounded bg-zinc-100 dark:bg-zinc-800" />
              </div>
            ))}
          </div>
        ) : history.length === 0 ? (
          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 py-4">
            {t("no-records")}
          </p>
        ) : (
          <div className="space-y-1">
            {history.map((item) => (
              <div
                key={item.id}
                className={cn(
                  "group flex items-center justify-between",
                  "p-2 rounded-lg",
                  "hover:bg-zinc-100 dark:hover:bg-zinc-800/50",
                  "transition-all duration-200"
                )}
              >
                <div className="flex items-center gap-2">
                  {getIcon(item)}
                  <div>
                    <h3 className="text-xs font-medium text-zinc-900 dark:text-zinc-100">
                      {item.reason}
                    </h3>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400">
                      {new Date(item.created_at).toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <span
                    className={cn("text-xs font-medium", {
                      "text-emerald-600 dark:text-emerald-400":
                        Number(item.change_amount) > 0,
                      "text-red-600 dark:text-red-400":
                        Number(item.change_amount) < 0,
                      "text-zinc-900 dark:text-zinc-100":
                        Number(item.change_amount) === 0,
                    })}
                  >
                    {Number(item.change_amount) > 0 ? "+" : ""}
                    {Number(item.change_amount).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      {pagination && pagination.total > itemsPerPage && (
        <div className="p-2 border-t border-zinc-100 dark:border-zinc-800 flex justify-center items-center gap-2">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCurrentPage((p) => p - 1)}
            disabled={currentPage === 0 || loading}
          >
            Previous
          </Button>
          <span className="text-xs text-zinc-600 dark:text-zinc-400">
            Page {currentPage + 1} of{" "}
            {Math.ceil(pagination.total / itemsPerPage)}
          </span>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setCurrentPage((p) => p + 1)}
            disabled={
              (currentPage + 1) * itemsPerPage >= pagination.total || loading
            }
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}

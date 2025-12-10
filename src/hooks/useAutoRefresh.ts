import { useEffect, useRef, useCallback } from "react";

interface UseAutoRefreshOptions {
  interval?: number; // 刷新間隔（毫秒），預設 30 秒
  enabled?: boolean; // 是否啟用自動刷新
  onRefresh: () => void | Promise<void>; // 刷新回調函數
}

/**
 * 自動刷新 Hook
 * 用於定期輪詢數據更新
 */
export function useAutoRefresh({
  interval = 30000, // 預設 30 秒
  enabled = true,
  onRefresh,
}: UseAutoRefreshOptions) {
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const onRefreshRef = useRef(onRefresh);

  // 保持 onRefresh 引用最新
  useEffect(() => {
    onRefreshRef.current = onRefresh;
  }, [onRefresh]);

  const startPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    intervalRef.current = setInterval(() => {
      onRefreshRef.current();
    }, interval);
  }, [interval]);

  const stopPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return () => {
      stopPolling();
    };
  }, [enabled, startPolling, stopPolling]);

  return { startPolling, stopPolling };
}

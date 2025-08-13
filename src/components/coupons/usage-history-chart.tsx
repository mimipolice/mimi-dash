"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useTranslations } from "next-intl";

import { Coupon } from "@/lib/api/coupons";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 定義圖表單筆數據的型別
type ChartData = {
  date: string; // 格式應為 "YYYY-MM-DD"
  usage: number;
};

// 定義組件 props 的型別
interface UsageHistoryChartProps {
  data: Coupon[];
}

const chartConfig = {
  usage: {
    label: "Usage", // 將會被翻譯取代
    color: "var(--chart-5)",
  },
} satisfies ChartConfig;

export function UsageHistoryChart({ data }: UsageHistoryChartProps) {
  const t = useTranslations("couponsManagement.history");
  const [timeRange, setTimeRange] = React.useState("90d");

  // 使用翻譯更新 chartConfig 的標籤
  chartConfig.usage.label = t("usage");

  const dailyUsageData = React.useMemo(() => {
    const usageByDate: { [key: string]: number } = {};
    data.forEach((c) => {
      const date = c.created_at.split("T")[0]; // 從 ISO 字串中取出日期部分
      usageByDate[date] =
        (usageByDate[date] || 0) + parseInt(c.actual_used_count, 10);
    });

    const sortedData = Object.entries(usageByDate)
      .map(([date, count]) => ({ date, usage: count }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // 如果沒有數據，返回空陣列
    if (sortedData.length === 0) {
      return [];
    }

    // 填補缺失的日期，使圖表數據連續
    const filledData: ChartData[] = [];
    const firstDate = new Date(sortedData[0].date);
    const lastDate = new Date(sortedData[sortedData.length - 1].date);
    const dateMap = new Map(sortedData.map((item) => [item.date, item.usage]));

    for (let d = firstDate; d <= lastDate; d.setDate(d.getDate() + 1)) {
      const dateStr = d.toISOString().split("T")[0];
      filledData.push({
        date: dateStr,
        usage: dateMap.get(dateStr) || 0,
      });
    }

    return filledData;
  }, [data]);

  const filteredData = React.useMemo(() => {
    const now = new Date();
    let daysToSubtract = 90;
    if (timeRange === "30d") {
      daysToSubtract = 30;
    } else if (timeRange === "7d") {
      daysToSubtract = 7;
    }

    const startDate = new Date();
    startDate.setDate(now.getDate() - (daysToSubtract - 1));
    startDate.setHours(0, 0, 0, 0);

    return dailyUsageData.filter((item) => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= now;
    });
  }, [dailyUsageData, timeRange]);

  // 假設您的翻譯檔案中有這些 key
  const timeRangeText = {
    "90d": t("last3Months"),
    "30d": t("last30Days"),
    "7d": t("last7Days"),
  }[timeRange];

  return (
    <Card className="pt-0">
      <CardHeader className="flex items-center gap-2 space-y-0 border-b py-5 sm:flex-row">
        <div className="grid flex-1 gap-1">
          <CardTitle>{t("title")}</CardTitle>
          <CardDescription>
            {t("description", { timeRangeText: timeRangeText || "" })}
          </CardDescription>
        </div>
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger
            className="hidden w-[160px] rounded-lg sm:ml-auto sm:flex"
            aria-label="Select a value"
          >
            <SelectValue placeholder={t("selectTimeRange")} />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="90d" className="rounded-lg">
              {t("last3Months")}
            </SelectItem>
            <SelectItem value="30d" className="rounded-lg">
              {t("last30Days")}
            </SelectItem>
            <SelectItem value="7d" className="rounded-lg">
              {t("last7Days")}
            </SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillUsage" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-usage)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-usage)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return date.toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                });
              }}
            />
            <YAxis />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return new Date(value).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="usage"
              type="natural"
              fill="url(#fillUsage)"
              stroke="var(--color-usage)"
              stackId="a"
            />
            <ChartLegend content={<ChartLegendContent />} />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

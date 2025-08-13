"use client";

import { Coupon } from "@/lib/api/coupons";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { useTranslations } from "next-intl";

interface SummaryCardsProps {
  data: Coupon[];
}

export function SummaryCards({ data }: SummaryCardsProps) {
  const t = useTranslations("couponsManagement.summary");

  const totalCoupons = data.length;
  const totalUsage = data.reduce(
    (sum, coupon) => sum + parseInt(coupon.actual_used_count, 10),
    0
  );
  const totalRewardAmount = data.reduce(
    (sum, coupon) =>
      sum +
      parseInt(coupon.reward_amount, 10) *
        parseInt(coupon.actual_used_count, 10),
    0
  );

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader>
          <CardDescription>{t("totalCoupons")}</CardDescription>
          <CardTitle>{totalCoupons}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>{t("totalUsage")}</CardDescription>
          <CardTitle>{totalUsage}</CardTitle>
        </CardHeader>
      </Card>
      <Card>
        <CardHeader>
          <CardDescription>{t("totalRewardAmount")}</CardDescription>
          <CardTitle>{totalRewardAmount.toLocaleString()}</CardTitle>
        </CardHeader>
      </Card>
    </div>
  );
}

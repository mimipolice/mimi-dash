"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CouponUsageData } from "@/lib/api/coupons";
import { useTranslations } from "next-intl";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

interface UsageDetailsDialogProps {
  isOpen: boolean;
  onClose: () => void;
  usageData: CouponUsageData | null;
  isLoading: boolean;
}

export function UsageDetailsDialog({
  isOpen,
  onClose,
  usageData,
  isLoading,
}: UsageDetailsDialogProps) {
  const t = useTranslations("couponsManagement.usageDialog");

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>
            {t("title")} - <Badge>{usageData?.coupon.code}</Badge>
          </DialogTitle>
          <DialogDescription>
            {t("description", { code: usageData?.coupon.code || "" })}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="text-center py-10">{t("loading")}</div>
        ) : usageData ? (
          <div className="grid gap-6">
            <div>
              <h3 className="font-semibold mb-2">{t("statisticsTitle")}</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                <div className="flex flex-col">
                  <span className="text-muted-foreground">
                    {t("totalUsed")}
                  </span>
                  <span className="font-bold">
                    {usageData.statistics.total_used}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">
                    {t("uniqueUsers")}
                  </span>
                  <span className="font-bold">
                    {usageData.statistics.unique_users}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">
                    {t("remainingUses")}
                  </span>
                  <span className="font-bold">
                    {usageData.statistics.remaining_uses}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">
                    {t("firstUsed")}
                  </span>
                  <span className="font-bold">
                    {usageData.statistics.first_used
                      ? new Date(
                          usageData.statistics.first_used
                        ).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-muted-foreground">{t("lastUsed")}</span>
                  <span className="font-bold">
                    {usageData.statistics.last_used
                      ? new Date(
                          usageData.statistics.last_used
                        ).toLocaleString()
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-2">{t("usageDetailsTitle")}</h3>
              <div className="rounded-md border max-h-60 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>{t("userNameHeader")}</TableHead>
                      <TableHead>{t("userIdHeader")}</TableHead>
                      <TableHead>{t("usedAtHeader")}</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {usageData.usage_details.map((use) => (
                      <TableRow key={use.id}>
                        <TableCell>{use.user_name}</TableCell>
                        <TableCell>{use.user_id}</TableCell>
                        <TableCell>
                          {new Date(use.used_at).toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-10">{t("noData")}</div>
        )}

        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">{t("closeButton")}</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

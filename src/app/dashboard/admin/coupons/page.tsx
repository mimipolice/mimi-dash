"use client";

import { useState, useEffect, useMemo } from "react";
import {
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useTranslations } from "next-intl";
import {
  Coupon,
  fetchCoupons,
  createCoupon,
  updateCoupon,
  deleteCoupon,
} from "@/lib/api/coupons";
import { getColumns } from "@/components/coupons/columns";
import { CouponFormDialog } from "@/components/coupons/coupon-form-dialog";
import { SummaryCards } from "@/components/coupons/summary-cards";
import { UsageHistoryChart } from "@/components/coupons/usage-history-chart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CouponsAdminPage() {
  const t = useTranslations("couponsManagement");
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentCoupon, setCurrentCoupon] = useState<Partial<Coupon> | null>(
    null
  );

  const refreshCoupons = async () => {
    try {
      const data = await fetchCoupons();
      setCoupons(data);
      toast.success(t("toasts.loadSuccess"));
    } catch (error) {
      toast.error(t("toasts.loadError"));
    }
  };

  useEffect(() => {
    refreshCoupons();
  }, []);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as any;

    data.is_active = data.is_active === "on";

    let promise;
    if (currentCoupon?.id) {
      promise = updateCoupon({ ...data, id: currentCoupon.id });
    } else {
      promise = createCoupon(data);
    }

    toast.promise(promise, {
      loading: currentCoupon?.id ? t("toasts.updating") : t("toasts.creating"),
      success: () => {
        setIsDialogOpen(false);
        setCurrentCoupon(null);
        refreshCoupons();
        return currentCoupon?.id
          ? t("toasts.updateSuccess")
          : t("toasts.createSuccess");
      },
      error: (err: any) =>
        err.message ||
        (currentCoupon?.id ? t("toasts.updateError") : t("toasts.createError")),
    });
  };

  const handleEdit = (coupon: Coupon) => {
    setCurrentCoupon(coupon);
    setIsDialogOpen(true);
  };

  const columns = useMemo(
    () => getColumns(t, handleEdit, refreshCoupons),
    [t, refreshCoupons]
  );

  const table = useReactTable({
    data: coupons,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      sorting,
    },
  });

  return (
    <div className="flex h-full flex-col">
      <main className="container mx-auto flex-1 p-4 md:p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <Button
            onClick={() => {
              setCurrentCoupon(null);
              setIsDialogOpen(true);
            }}
          >
            {t("createCoupon")}
          </Button>
        </div>

        <div className="mt-4">
          <SummaryCards data={coupons} />
        </div>

        <div className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>{t("history.title")}</CardTitle>
            </CardHeader>
            <CardContent>
              <UsageHistoryChart data={coupons} />
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 rounded-md border overflow-x-auto p-4">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-24 text-center"
                  >
                    {t("noResults")}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </main>

      <CouponFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        coupon={currentCoupon}
        setCoupon={setCurrentCoupon}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}

"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ColumnDef,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DatePicker } from "@/components/ui/date-picker";
import { SiteHeader } from "@/components/site-header";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, ArrowUpDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useTranslations } from "next-intl";

type Coupon = {
  id: string;
  code: string;
  reward_amount: string;
  usage_limit: string;
  expires_at: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  actual_used_count: string;
};

async function fetchCoupons(): Promise<Coupon[]> {
  console.log("Fetching coupons...");
  const response = await fetch("/api/admin/coupons", {
    headers: {
      "X-Mimi-Api-Token": process.env.NEXT_PUBLIC_MIMI_API_TOKEN || "",
    },
  });
  console.log("Fetch response status:", response.status);
  if (!response.ok) {
    throw new Error("Failed to fetch coupons");
  }
  const result = await response.json();
  console.log("Coupons data from API:", result.data);
  return result.data;
}

async function createCoupon(
  data: Omit<
    Coupon,
    "id" | "is_active" | "created_at" | "updated_at" | "actual_used_count"
  >
) {
  const response = await fetch("/api/admin/coupons", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Mimi-Api-Token": process.env.NEXT_PUBLIC_MIMI_API_TOKEN || "",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error.message);
  }
  return response.json();
}

async function updateCoupon(data: Partial<Coupon> & { id: string }) {
  const response = await fetch(`/api/admin/coupons`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      "X-Mimi-Api-Token": process.env.NEXT_PUBLIC_MIMI_API_TOKEN || "",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error.message);
  }
  return response.json();
}

async function deleteCoupon(id: string) {
  const response = await fetch(`/api/admin/coupons/${id}`, {
    method: "DELETE",
    headers: {
      "X-Mimi-Api-Token": process.env.NEXT_PUBLIC_MIMI_API_TOKEN || "",
    },
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error.message);
  }
  return response.json();
}

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

    // Convert checkbox value
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

  const handleDelete = (id: string) => {
    toast.promise(deleteCoupon(id), {
      loading: t("toasts.deleting"),
      success: () => {
        refreshCoupons();
        return t("toasts.deleteSuccess");
      },
      error: (err: any) => err.message || t("toasts.deleteError"),
    });
  };

  const columns: ColumnDef<Coupon>[] = useMemo(
    () => [
      {
        accessorKey: "code",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("table.codeHeader")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: "reward_amount",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("table.rewardAmountHeader")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: "usage_limit",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("table.usageLimitHeader")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: "actual_used_count",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("table.usedCountHeader")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
      },
      {
        accessorKey: "expires_at",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("table.expiresAtHeader")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const expiresAt = row.getValue("expires_at");
          if (!expiresAt) {
            return t("status.permanent");
          }
          const date = new Date(expiresAt as string);
          return isNaN(date.getTime())
            ? t("table.notAvailable")
            : date.toLocaleString();
        },
      },
      {
        accessorKey: "created_at",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("table.createdAtHeader")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = new Date(row.getValue("created_at"));
          return isNaN(date.getTime())
            ? t("table.notAvailable")
            : date.toLocaleString();
        },
      },
      {
        accessorKey: "updated_at",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("table.updatedAtHeader")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => {
          const date = new Date(row.getValue("updated_at"));
          return isNaN(date.getTime())
            ? t("table.notAvailable")
            : date.toLocaleString();
        },
      },
      {
        accessorKey: "is_active",
        header: ({ column }) => (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            {t("table.statusHeader")}
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        ),
        cell: ({ row }) => (
          <Badge variant={row.getValue("is_active") ? "default" : "secondary"}>
            {row.getValue("is_active")
              ? t("status.active")
              : t("status.inactive")}
          </Badge>
        ),
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const coupon = row.original;
          return (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                  <span className="sr-only">{t("table.openMenu")}</span>
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{t("table.actionsLabel")}</DropdownMenuLabel>
                <DropdownMenuItem
                  onClick={() => {
                    setCurrentCoupon(coupon);
                    setIsDialogOpen(true);
                  }}
                >
                  {t("table.editAction")}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="text-red-600"
                  onClick={() => handleDelete(coupon.id)}
                >
                  {t("table.deleteAction")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          );
        },
      },
    ],
    []
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
        <div className="mt-4 rounded-md border">
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {currentCoupon?.id
                ? t("dialog.editTitle")
                : t("dialog.createTitle")}
            </DialogTitle>
            <DialogDescription>
              {currentCoupon?.id
                ? t("dialog.editDescription")
                : t("dialog.createDescription")}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="code" className="text-right">
                  {t("dialog.codeLabel")}
                </Label>
                <Input
                  id="code"
                  name="code"
                  defaultValue={currentCoupon?.code || ""}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reward_amount" className="text-right">
                  {t("dialog.rewardAmountLabel")}
                </Label>
                <Input
                  id="reward_amount"
                  name="reward_amount"
                  type="number"
                  defaultValue={currentCoupon?.reward_amount || ""}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="usage_limit" className="text-right">
                  {t("dialog.usageLimitLabel")}
                </Label>
                <Input
                  id="usage_limit"
                  name="usage_limit"
                  type="number"
                  defaultValue={currentCoupon?.usage_limit || ""}
                  className="col-span-3"
                  required
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="expires_at" className="text-right">
                  {t("dialog.expiresAtLabel")}
                </Label>
                <DatePicker
                  date={
                    currentCoupon?.expires_at
                      ? new Date(currentCoupon.expires_at)
                      : undefined
                  }
                  setDate={(date) => {
                    setCurrentCoupon((prev) => ({
                      ...prev,
                      expires_at: date?.toISOString(),
                    }));
                  }}
                />
              </div>
              {currentCoupon?.id && (
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="is_active" className="text-right">
                    {t("dialog.activeLabel")}
                  </Label>
                  <Checkbox
                    id="is_active"
                    name="is_active"
                    defaultChecked={currentCoupon?.is_active}
                  />
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="submit">{t("dialog.saveButton")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

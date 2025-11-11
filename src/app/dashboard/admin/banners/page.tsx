"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
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
import { Banner } from "@/lib/apiClient";
import { fetchBanners, createBanner, updateBanner } from "@/lib/api/banners";
import { fetchRouteOptions } from "@/lib/api/routes";
import { getColumns } from "@/components/banners/columns";
import { BannerFormDialog } from "@/components/banners/banner-form-dialog";

export default function BannersAdminPage() {
  const t = useTranslations("bannersManagement");
  const { data: session, status } = useSession();
  const router = useRouter();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentBanner, setCurrentBanner] = useState<Partial<Banner> | null>(
    null
  );
  const [routeOptions, setRouteOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const refreshBanners = useCallback(async () => {
    try {
      const data = await fetchBanners();
      setBanners(data);
      toast.success(t("toasts.loadSuccess"));
    } catch (error) {
      toast.error(t("toasts.loadError"));
    }
  }, [t]);

  useEffect(() => {
    if (status === "loading") return;
    if (!session?.user?.isAdmin) {
      router.push("/dashboard");
    } else {
      refreshBanners();
      const fetchOptions = async () => {
        try {
          const options = await fetchRouteOptions();
          setRouteOptions(options);
        } catch (error) {
          toast.error(t("toasts.loadOptionsError"));
        }
      };
      fetchOptions();
    }
  }, [session, status, router, refreshBanners]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as any;

    // Convert empty strings to null for date fields
    if (data.displayFrom === "") data.displayFrom = null;
    if (data.displayUntil === "") data.displayUntil = null;

    let promise;
    if (currentBanner?.id) {
      promise = updateBanner(currentBanner.id as string, data);
    } else {
      promise = createBanner(data);
    }

    toast.promise(promise, {
      loading: currentBanner?.id ? t("toasts.updating") : t("toasts.creating"),
      success: () => {
        setIsDialogOpen(false);
        setCurrentBanner(null);
        refreshBanners();
        return currentBanner?.id
          ? t("toasts.updateSuccess")
          : t("toasts.createSuccess");
      },
      error: (err: any) =>
        err.message ||
        (currentBanner?.id ? t("toasts.updateError") : t("toasts.createError")),
    });
  };

  const handleEdit = useCallback((banner: Banner) => {
    setCurrentBanner(banner);
    setIsDialogOpen(true);
  }, []);

  const columns = useMemo(
    () => getColumns(t, handleEdit, refreshBanners),
    [t, handleEdit, refreshBanners]
  );

  const table = useReactTable({
    data: banners,
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
              setCurrentBanner(null);
              setIsDialogOpen(true);
            }}
          >
            {t("createBanner")}
          </Button>
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

      <BannerFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        banner={currentBanner}
        setBanner={setCurrentBanner}
        onSubmit={handleFormSubmit}
        routeOptions={routeOptions}
      />
    </div>
  );
}

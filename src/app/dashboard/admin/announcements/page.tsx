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
import { Announcement } from "@/lib/apiClient";
import {
  fetchAnnouncements,
  createAnnouncement,
  updateAnnouncement,
} from "@/lib/api/announcements";
import { fetchImageOptions } from "@/lib/api/routes";
import { getColumns } from "@/components/announcements/columns";
import { AnnouncementFormDialog } from "@/components/announcements/announcement-form-dialog";
import { AnnouncementPreviewDialog } from "@/components/announcements/announcement-preview-dialog";

export default function AnnouncementsAdminPage() {
  const t = useTranslations("announcementsManagement");
  const { data: session, status } = useSession();
  const router = useRouter();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [currentAnnouncement, setCurrentAnnouncement] =
    useState<Partial<Announcement> | null>(null);
  const [previewAnnouncement, setPreviewAnnouncement] =
    useState<Announcement | null>(null);
  const [imageOptions, setImageOptions] = useState<
    { label: string; value: string }[]
  >([]);

  const refreshAnnouncements = useCallback(async () => {
    try {
      const data = await fetchAnnouncements();
      setAnnouncements(data);
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
      refreshAnnouncements();
      const fetchOptions = async () => {
        try {
          const options = await fetchImageOptions();
          setImageOptions(options);
        } catch (error) {
          toast.error(t("toasts.loadOptionsError"));
        }
      };
      fetchOptions();
    }
  }, [session, status, router, refreshAnnouncements]);

  const handleFormSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries()) as any;

    let promise;
    if (currentAnnouncement?.id) {
      promise = updateAnnouncement(currentAnnouncement.id.toString(), data);
    } else {
      promise = createAnnouncement(data);
    }

    toast.promise(promise, {
      loading: currentAnnouncement?.id
        ? t("toasts.updating")
        : t("toasts.creating"),
      success: () => {
        setIsDialogOpen(false);
        setCurrentAnnouncement(null);
        refreshAnnouncements();
        return currentAnnouncement?.id
          ? t("toasts.updateSuccess")
          : t("toasts.createSuccess");
      },
      error: (err: any) =>
        err.message ||
        (currentAnnouncement?.id
          ? t("toasts.updateError")
          : t("toasts.createError")),
    });
  };

  const handleEdit = useCallback((announcement: Announcement) => {
    setCurrentAnnouncement(announcement);
    setIsDialogOpen(true);
  }, []);

  const handlePreview = useCallback((announcement: Announcement) => {
    setPreviewAnnouncement(announcement);
    setIsPreviewOpen(true);
  }, []);

  const columns = useMemo(
    () => getColumns(t, handleEdit, handlePreview, refreshAnnouncements),
    [t, handleEdit, handlePreview, refreshAnnouncements]
  );

  const table = useReactTable({
    data: announcements,
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
              setCurrentAnnouncement(null);
              setIsDialogOpen(true);
            }}
          >
            {t("createAnnouncement")}
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

      <AnnouncementFormDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        announcement={currentAnnouncement}
        setAnnouncement={setCurrentAnnouncement}
        onSubmit={handleFormSubmit}
        imageOptions={imageOptions}
      />

      <AnnouncementPreviewDialog
        open={isPreviewOpen}
        onOpenChange={setIsPreviewOpen}
        announcement={previewAnnouncement}
      />
    </div>
  );
}

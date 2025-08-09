"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbList,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ExternalLink,
  MoreHorizontal,
  Trash2,
  Edit,
  Settings,
  LoaderCircle,
  Plus,
  ChevronLeft,
  ChevronRight,
  Funnel,
  Server,
  Activity,
  Pause,
  X,
  ClockPlus,
} from "lucide-react";
import { Link } from "next-view-transitions";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import toast from "react-hot-toast";
import appConfig from "@/config";
import { useTransitionRouter } from "next-view-transitions";
const DEFAULT_PRICING = {
  base: 0,
  cpu: 0,
  ram: 0,
  disk: 0,
  databases: 0,
  backups: 0,
  allocations: 0,
};

const safeToFixed = (
  value: number | undefined,
  decimals: number = 2
): string => {
  return (value ?? 0).toFixed(decimals);
};

const formSchema = z.object({
  serverType: z.number({
    message: "Please select a server type.",
  }),
  nestId: z.number({
    message: "Please select a server type.",
  }),
  cpu: z.number().min(appConfig.limit.cpu.min).max(appConfig.limit.cpu.max),
  ram: z.number().min(appConfig.limit.ram.min).max(appConfig.limit.ram.max),
  disk: z.number().min(appConfig.limit.disk.min).max(appConfig.limit.disk.max),
  databases: z
    .number()
    .min(appConfig.limit.databases.min)
    .max(appConfig.limit.databases.max),
  backups: z
    .number()
    .min(appConfig.limit.backups.min)
    .max(appConfig.limit.backups.max),
  allocations: z
    .number()
    .min(appConfig.limit.allocations.min)
    .max(appConfig.limit.allocations.max),
  autoRenew: z.boolean(),
});

interface Egg {
  eggId: number;
  eggName: string;
}

interface Nest {
  nestId: number;
  nestName: string;
  eggs: Egg[];
}

interface LocationAttributes {
  id: number;
  short: string;
  long: string | null;
  updated_at: string;
  created_at: string;
}

interface Location {
  object: string;
  attributes: LocationAttributes;
}

interface ResourcePricing {
  base: number;
  cpu: number;
  ram: number;
  disk: number;
  databases: number;
  backups: number;
  allocations: number;
}

interface ServerResources {
  cpu: number;
  ram: number;
  disk: number;
  databases: number;
  allocations: number;
  backups: number;
}

interface Server {
  resources: ServerResources;
  id: number;
  identifier: string;
  name: string;
  expiresAt: string;
  autoRenew: boolean;
  status: string;
  _id: string;
  createAt: string;
}

interface UserInfo {
  status: string;
  _id: string;
  id: string;
  coins: number;
  servers: Server[];
  panelId: number;
  __v: number;
}

const ITEMS_PER_PAGE = 5;

export default function DashboardServersManage() {
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedServers, setSelectedServers] = useState<Set<number>>(
    new Set()
  );
  const [currentPage, setCurrentPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string[]>([
    "Active",
    "Suspended",
    "Deleted",
  ]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [serverToDelete, setServerToDelete] = useState<{
    identifier: string;
    id: number;
  } | null>(null);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBulkDeleting, setIsBulkDeleting] = useState(false);

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [serverToEdit, setServerToEdit] = useState<Server | null>(null);
  const [isModifying, setIsModifying] = useState(false);

  const [renewDialogOpen, setRenewDialogOpen] = useState(false);
  const [serverToRenew, setServerToRenew] = useState<Server | null>(null);
  const [isRenewing, setIsRenewing] = useState(false);
  const [renewCost, setRenewCost] = useState(0);

  const [nests, setNests] = useState<Nest[]>([]);
  const [locations, setLocations] = useState<Location[]>([]);
  const [pricing, setPricing] = useState<ResourcePricing>({
    base: 0,
    cpu: 0,
    ram: 0,
    disk: 0,
    databases: 0,
    backups: 0,
    allocations: 0,
  });
  const [totalPrice, setTotalPrice] = useState(0);
  const [priceBreakdown, setPriceBreakdown] = useState({
    base: 0,
    cpu: 0,
    ram: 0,
    disk: 0,
    databases: 0,
    backups: 0,
    allocations: 0,
  });
  const [isLoadingEggs, setIsLoadingEggs] = useState(false);
  const [isLoadingPricing, setIsLoadingPricing] = useState(false);

  const hasEnoughDroplets = () => {
    if (!userInfo || isNaN(totalPrice)) return false;
    return userInfo.coins >= totalPrice;
  };

  const getRemainingDroplets = () => {
    if (!userInfo || isNaN(totalPrice)) return 0;
    return userInfo.coins - totalPrice;
  };

  const calculateOriginalPrice = () => {
    if (!serverToEdit || !pricing) return 0;

    const baseCost = pricing.base ?? 0;
    const cpuCost = serverToEdit.resources.cpu * (pricing.cpu ?? 0);
    const ramCost = serverToEdit.resources.ram * (pricing.ram ?? 0);
    const diskCost = serverToEdit.resources.disk * (pricing.disk ?? 0);
    const databasesCost =
      serverToEdit.resources.databases * (pricing.databases ?? 0);
    const backupsCost = serverToEdit.resources.backups * (pricing.backups ?? 0);
    const allocationsCost =
      serverToEdit.resources.allocations * (pricing.allocations ?? 0);

    return parseFloat(
      (
        baseCost +
        cpuCost +
        ramCost +
        diskCost +
        databasesCost +
        backupsCost +
        allocationsCost
      ).toFixed(2)
    );
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      serverType: undefined,
      nestId: undefined,
      cpu: appConfig.limit.cpu.default,
      ram: appConfig.limit.ram.default,
      disk: appConfig.limit.disk.default,
      databases: appConfig.limit.databases.default,
      backups: appConfig.limit.backups.default,
      allocations: appConfig.limit.allocations.default,
      autoRenew: true,
    },
  });

  const watchedFields = form.watch([
    "cpu",
    "ram",
    "disk",
    "databases",
    "backups",
    "allocations",
  ]);
  const [cpu, ram, disk, databases, backups, allocations] = watchedFields;
  const router = useTransitionRouter();
  useEffect(() => {
    fetchUserInfo();
  }, []);

  useEffect(() => {
    const calculatePrice = () => {
      const baseCost = pricing?.base ?? 0;
      const cpuCost = cpu * (pricing?.cpu ?? 0);
      const ramCost = ram * (pricing?.ram ?? 0);
      const diskCost = disk * (pricing?.disk ?? 0);
      const databasesCost = databases * (pricing?.databases ?? 0);
      const backupsCost = backups * (pricing?.backups ?? 0);
      const allocationsCost = allocations * (pricing?.allocations ?? 0);

      let originalBreakdown = {
        base: 0,
        cpu: 0,
        ram: 0,
        disk: 0,
        databases: 0,
        backups: 0,
        allocations: 0,
      };

      if (serverToEdit && pricing) {
        originalBreakdown = {
          base: pricing.base ?? 0,
          cpu: serverToEdit.resources.cpu * (pricing.cpu ?? 0),
          ram: serverToEdit.resources.ram * (pricing.ram ?? 0),
          disk: serverToEdit.resources.disk * (pricing.disk ?? 0),
          databases:
            serverToEdit.resources.databases * (pricing.databases ?? 0),
          backups: serverToEdit.resources.backups * (pricing.backups ?? 0),
          allocations:
            serverToEdit.resources.allocations * (pricing.allocations ?? 0),
        };
      }

      const breakdown = {
        base: Math.max(0, baseCost - originalBreakdown.base),
        cpu: Math.max(0, cpuCost - originalBreakdown.cpu),
        ram: Math.max(0, ramCost - originalBreakdown.ram),
        disk: Math.max(0, diskCost - originalBreakdown.disk),
        databases: Math.max(0, databasesCost - originalBreakdown.databases),
        backups: Math.max(0, backupsCost - originalBreakdown.backups),
        allocations: Math.max(
          0,
          allocationsCost - originalBreakdown.allocations
        ),
      };

      setPriceBreakdown(breakdown);

      const totalAdditionalCost =
        breakdown.base +
        breakdown.cpu +
        breakdown.ram +
        breakdown.disk +
        breakdown.databases +
        breakdown.backups +
        breakdown.allocations;

      return parseFloat(totalAdditionalCost.toFixed(2));
    };

    if (!isLoadingPricing) {
      const price = calculatePrice();
      setTotalPrice(price);
    }
  }, [
    cpu,
    ram,
    disk,
    databases,
    backups,
    allocations,
    pricing,
    isLoadingPricing,
    serverToEdit,
  ]);

  const fetchUserInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/userinfo");
      if (response.ok) {
        const data = await response.json();
        setUserInfo(data);
      } else {
        console.error("Failed to fetch user info");
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDaysUntilExpiry = (expiresAt: string) => {
    const expireDate = new Date(expiresAt);
    const now = new Date();
    const diffTime = expireDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Active":
        return (
          <Badge variant="default" className="bg-green-500 hover:bg-green-600">
            Active
          </Badge>
        );
      case "Suspended":
        return (
          <Badge
            variant="secondary"
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            Suspended
          </Badge>
        );
      case "Deleted":
        return (
          <Badge
            variant="outline"
            className="bg-gray-400 text-gray-600 border-gray-400"
          >
            Deleted
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked && userInfo?.servers) {
      const currentPageServers = userInfo.servers.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
      );
      const selectableServers = currentPageServers.filter(
        (server) => server.status !== "Deleted"
      );
      setSelectedServers(new Set(selectableServers.map((server) => server.id)));
    } else {
      setSelectedServers(new Set());
    }
  };

  const handleSelectServer = (serverId: number, checked: boolean) => {
    const server = userInfo?.servers.find((s) => s.id === serverId);
    if (server && server.status === "Deleted") {
      return;
    }

    const newSelected = new Set(selectedServers);
    if (checked) {
      newSelected.add(serverId);
    } else {
      newSelected.delete(serverId);
    }
    setSelectedServers(newSelected);
  };

  const handleManageServer = (identifier: string) => {
    const panelUrl = process.env.NEXT_PUBLIC_PANEL_URL;
    window.open(`${panelUrl}/server/${identifier}`, "_blank");
  };

  const handleDeleteServer = (server: Server) => {
    setServerToDelete({ identifier: server.identifier, id: server.id });
    setDeleteDialogOpen(true);
  };

  const handleBulkDelete = () => {
    setBulkDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!serverToDelete) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/servers?id=${serverToDelete.id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        await fetchUserInfo();
        setDeleteDialogOpen(false);
        setServerToDelete(null);
      } else {
        console.error("Delete failed:", result.error);
        toast.error(`Error deleting server: ${result.error}`);
      }
    } catch (error) {
      console.error("Error deleting server:", error);
      toast.error("An unexpected error occurred while deleting the server.");
    } finally {
      setIsDeleting(false);
    }
  };

  const confirmBulkDelete = async () => {
    if (selectedServers.size === 0) return;

    try {
      setIsBulkDeleting(true);
      const serverIds = Array.from(selectedServers).join(",");
      const response = await fetch(`/api/servers?serverIds=${serverIds}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        await fetchUserInfo();
        setBulkDeleteDialogOpen(false);
        setSelectedServers(new Set());
      } else {
        console.error("Bulk delete failed:", result.error);
        toast.error(`Error during bulk deletion: ${result.error}`);
      }
    } catch (error) {
      console.error("Error bulk deleting servers:", error);
      toast.error("An unexpected error occurred during bulk deletion.");
    } finally {
      setIsBulkDeleting(false);
    }
  };

  const handleRenewServer = async (identifier: string) => {
    const server = userInfo?.servers.find((s) => s.identifier === identifier);
    if (!server) {
      toast.error("Server not found");
      return;
    }

    try {
      const pricingResponse = await axios.get("/api/pricing");
      const currentPricing = pricingResponse.data.data;
      const cost =
        currentPricing.base +
        server.resources.cpu * currentPricing.cpu +
        server.resources.ram * currentPricing.ram +
        server.resources.disk * currentPricing.disk +
        server.resources.databases * currentPricing.databases +
        server.resources.backups * currentPricing.backups +
        server.resources.allocations * currentPricing.allocations;

      setRenewCost(cost);
      setServerToRenew(server);
      setRenewDialogOpen(true);
    } catch (error) {
      console.error("Failed to calculate renewal cost:", error);
      toast.error("Failed to calculate renewal cost");
    }
  };

  const confirmRenew = async () => {
    if (!serverToRenew) return;

    setIsRenewing(true);
    try {
      const response = await axios.post("/api/renew", {
        serverId: serverToRenew.id,
      });

      if (response.data.status == "success") {
        toast.success("Server renewed successfully.");
        setRenewDialogOpen(false);
        await fetchUserInfo();
      } else {
        toast.error(response.data.message || "Failed to renew server.");
      }
    } catch (error) {
      console.error("Renew error:", error);
      if (axios.isAxiosError(error) && error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to renew server.");
      }
    } finally {
      setIsRenewing(false);
    }
  };

  const handleEditServer = (serverId: number) => {
    const server = userInfo?.servers.find((s) => s.id === serverId);
    if (server) {
      setServerToEdit(server);
      form.reset({
        cpu: server.resources.cpu,
        ram: server.resources.ram,
        disk: server.resources.disk,
        databases: server.resources.databases,
        allocations: server.resources.allocations,
        backups: server.resources.backups,
        autoRenew: server.autoRenew,
        serverType: undefined,
        nestId: undefined,
      });
      setEditDialogOpen(true);
      fetchDataForEdit();
    }
  };

  const fetchDataForEdit = async () => {
    await Promise.all([fetchEggs(), fetchPricing()]);
  };

  const fetchEggs = async () => {
    try {
      setIsLoadingEggs(true);
      const response = await axios.get("/api/eggs");
      if (
        response.data.status === "success" &&
        Array.isArray(response.data.data)
      ) {
        setNests(response.data.data);
      }
    } catch (error) {
      console.error("Error fetching eggs:", error);
      toast.error("Error loading data.");
    } finally {
      setIsLoadingEggs(false);
    }
  };

  const fetchPricing = async () => {
    try {
      setIsLoadingPricing(true);
      const response = await axios.get("/api/pricing");

      if (response.data.success) {
        const fetchedPricing = response.data.data;
        const validatedPricing: ResourcePricing = {
          base: fetchedPricing?.base ?? DEFAULT_PRICING.base,
          cpu: fetchedPricing?.cpu ?? DEFAULT_PRICING.cpu,
          ram: fetchedPricing?.ram ?? DEFAULT_PRICING.ram,
          disk: fetchedPricing?.disk ?? DEFAULT_PRICING.disk,
          databases: fetchedPricing?.databases ?? DEFAULT_PRICING.databases,
          backups: fetchedPricing?.backups ?? DEFAULT_PRICING.backups,
          allocations:
            fetchedPricing?.allocations ?? DEFAULT_PRICING.allocations,
        };
        setPricing(validatedPricing);
      } else {
        console.error("Failed to fetch pricing:", response.data.error);
        setPricing(DEFAULT_PRICING);
        toast.error("Error fetching pricing.");
      }
    } catch (error) {
      console.error("Error fetching pricing:", error);
      setPricing(DEFAULT_PRICING);
      toast.error("Error fetching pricing.");
    } finally {
      setIsLoadingPricing(false);
    }
  };

  const onSubmitEdit = async (values: z.infer<typeof formSchema>) => {
    if (!serverToEdit) return;

    try {
      setIsModifying(true);
      const loadingToast = toast.loading(
        `Modifying server: ${serverToEdit.name || "Unnamed"} (${
          serverToEdit.identifier
        })`
      );

      const response = await axios.patch("/api/servers", {
        serverId: serverToEdit.id,
        serverType: values.serverType,
        nestId: values.nestId,
        cpu: values.cpu,
        ram: values.ram,
        disk: values.disk,
        databases: values.databases,
        allocations: values.allocations,
        backups: values.backups,
        autoRenew: values.autoRenew,
      });

      toast.dismiss(loadingToast);

      if (response.data.success) {
        toast.success(
          `Successfully modified: ${serverToEdit.name || "Unnamed"} (${
            serverToEdit.identifier
          })`
        );
        setEditDialogOpen(false);
        setServerToEdit(null);
        await fetchUserInfo();
      } else {
        toast.error(response.data.error || "Failed to modify server.");
      }
    } catch (error) {
      console.error("Error modifying server:", error);
      if (axios.isAxiosError(error)) {
        const errorMessage = error.response?.data?.error;
        if (errorMessage && errorMessage.includes("Insufficient balance")) {
          toast.error("Insufficient balance.");
        } else {
          toast.error(errorMessage || "Failed to modify server.");
        }
      } else {
        toast.error("Failed to modify server.");
      }
    } finally {
      setIsModifying(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <LoaderCircle className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!userInfo) {
    return (
      <div className="text-center py-8">
        <p>Error loading data.</p>
      </div>
    );
  }

  const servers = userInfo.servers || [];

  const filteredServers =
    statusFilter.length === 0
      ? []
      : servers.filter((server) => statusFilter.includes(server.status));

  const totalPages = Math.ceil(filteredServers.length / ITEMS_PER_PAGE);
  const currentPageServers = filteredServers.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const allCurrentPageSelected =
    currentPageServers.length > 0 &&
    currentPageServers
      .filter((server) => server.status !== "Deleted")
      .every((server) => selectedServers.has(server.id));

  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2">
        <div className="flex items-center gap-2 px-4">
          <SidebarTrigger className="-ml-1" />
          <Separator orientation="vertical" className="mr-2 h-4" />
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem className="hidden md:block">
                <BreadcrumbLink href="/dashboard">Servers</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Manage</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="p-4 sm:p-6 lg:p-10 space-y-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div>
            <h1 className="text-3xl font-bold">Manage Servers</h1>
            <p className="text-muted-foreground">
              View and manage your servers.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            {selectedServers.size > 0 && (
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                className="flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
              >
                <Trash2 className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">
                  Delete Selected ({selectedServers.size})
                </span>
              </Button>
            )}
            <Button
              onClick={() => router.push("/dashboard/servers/create")}
              className="flex items-center justify-center gap-2 text-sm sm:text-base whitespace-nowrap"
            >
              <Plus className="h-4 w-4 flex-shrink-0" />
              <span>Create Server</span>
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Total Servers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{servers.length}</div>
            </CardContent>
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-10">
              <Server className="w-20 h-20 transform rotate-12 scale-110" />
            </div>
          </Card>
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-600">
                {servers.filter((s) => s.status === "Active").length}
              </div>
            </CardContent>
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-10">
              <Activity className="w-20 h-20 transform rotate-12 scale-110 text-green-500" />
            </div>
          </Card>
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">
                Suspended
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600">
                {servers.filter((s) => s.status === "Suspended").length}
              </div>
            </CardContent>
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-10">
              <Pause className="w-20 h-20 transform rotate-12 scale-110 text-orange-500" />
            </div>
          </Card>
          <Card className="relative overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Deleted</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-gray-500">
                {servers.filter((s) => s.status === "Deleted").length}
              </div>
            </CardContent>
            <div className="absolute -right-4 top-1/2 -translate-y-1/2 opacity-10">
              <X className="w-20 h-20 transform rotate-12 scale-110 text-gray-400" />
            </div>
          </Card>
        </div>
        <Card>
          <CardContent className="">
            <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:space-y-0 gap-4">
              <span className="text-sm font-medium">Filter by status:</span>
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 w-full sm:w-auto"
                    >
                      <Funnel className="h-4 w-4 flex-shrink-0" />
                      <span className="truncate">Filter by status</span>
                      <span className="ml-auto sm:ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full flex-shrink-0">
                        {statusFilter.length}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="start">
                    <div className="p-2 space-y-2">
                      <div
                        className="flex items-center gap-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                        onClick={() => {
                          const isChecked = statusFilter.includes("Active");
                          if (!isChecked) {
                            setStatusFilter([...statusFilter, "Active"]);
                          } else {
                            setStatusFilter(
                              statusFilter.filter((s) => s !== "Active")
                            );
                          }
                          setCurrentPage(1);
                        }}
                      >
                        <Checkbox
                          checked={statusFilter.includes("Active")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setStatusFilter([...statusFilter, "Active"]);
                            } else {
                              setStatusFilter(
                                statusFilter.filter((s) => s !== "Active")
                              );
                            }
                            setCurrentPage(1);
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                          <span className="text-sm">Active</span>
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                        onClick={() => {
                          const isChecked = statusFilter.includes("Suspended");
                          if (!isChecked) {
                            setStatusFilter([...statusFilter, "Suspended"]);
                          } else {
                            setStatusFilter(
                              statusFilter.filter((s) => s !== "Suspended")
                            );
                          }
                          setCurrentPage(1);
                        }}
                      >
                        <Checkbox
                          checked={statusFilter.includes("Suspended")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setStatusFilter([...statusFilter, "Suspended"]);
                            } else {
                              setStatusFilter(
                                statusFilter.filter((s) => s !== "Suspended")
                              );
                            }
                            setCurrentPage(1);
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                          <span className="text-sm">Suspended</span>
                        </div>
                      </div>
                      <div
                        className="flex items-center gap-2 p-2 hover:bg-accent rounded-sm cursor-pointer"
                        onClick={() => {
                          const isChecked = statusFilter.includes("Deleted");
                          if (!isChecked) {
                            setStatusFilter([...statusFilter, "Deleted"]);
                          } else {
                            setStatusFilter(
                              statusFilter.filter((s) => s !== "Deleted")
                            );
                          }
                          setCurrentPage(1);
                        }}
                      >
                        <Checkbox
                          checked={statusFilter.includes("Deleted")}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setStatusFilter([...statusFilter, "Deleted"]);
                            } else {
                              setStatusFilter(
                                statusFilter.filter((s) => s !== "Deleted")
                              );
                            }
                            setCurrentPage(1);
                          }}
                        />
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                          <span className="text-sm">Deleted</span>
                        </div>
                      </div>
                      <div className="border-t pt-2 mt-2 flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setStatusFilter(["Active", "Suspended", "Deleted"]);
                            setCurrentPage(1);
                          }}
                          className="flex-1 bg-blue-500/30"
                        >
                          Select All
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setStatusFilter([]);
                            setCurrentPage(1);
                          }}
                          className="flex-1 bg-destructive/30"
                        >
                          Clear
                        </Button>
                      </div>
                    </div>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="hidden sm:flex flex-wrap items-center gap-2">
                  {statusFilter.map((status) => (
                    <Badge
                      key={status}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      <div
                        className={`w-2 h-2 rounded-full flex-shrink-0 ${
                          status === "Active"
                            ? "bg-green-500"
                            : status === "Suspended"
                            ? "bg-orange-500"
                            : "bg-gray-400"
                        }`}
                      ></div>
                      <span className="truncate">{status}</span>
                      <button
                        onClick={() => {
                          setStatusFilter(
                            statusFilter.filter((s) => s !== status)
                          );
                          setCurrentPage(1);
                        }}
                        className="ml-1 hover:bg-background/20 rounded-full flex-shrink-0"
                      >
                        ×
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="flex sm:hidden flex-wrap gap-2">
                {statusFilter.map((status) => (
                  <Badge
                    key={status}
                    variant="secondary"
                    className="flex items-center gap-1 text-xs"
                  >
                    <div
                      className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        status === "Active"
                          ? "bg-green-500"
                          : status === "Suspended"
                          ? "bg-orange-500"
                          : "bg-gray-400"
                      }`}
                    ></div>
                    <span className="truncate">{status}</span>
                    <button
                      onClick={() => {
                        setStatusFilter(
                          statusFilter.filter((s) => s !== status)
                        );
                        setCurrentPage(1);
                      }}
                      className="ml-1 hover:bg-background/20 rounded-full flex-shrink-0"
                    >
                      ×
                    </button>
                  </Badge>
                ))}
              </div>
              <span className="text-sm text-muted-foreground text-center sm:text-left">
                {`Showing ${filteredServers.length} of ${servers.length} servers.`}
              </span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Server List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Checkbox
                        checked={allCurrentPageSelected}
                        disabled={
                          currentPageServers.filter(
                            (server) => server.status !== "Deleted"
                          ).length === 0
                        }
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>CPU</TableHead>
                    <TableHead>Memory</TableHead>
                    <TableHead>Disk</TableHead>
                    <TableHead>Databases</TableHead>
                    <TableHead>Allocations</TableHead>
                    <TableHead>Backups</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Auto Renew</TableHead>
                    <TableHead>Expiration</TableHead>
                    <TableHead>Days Remaining</TableHead>
                    <TableHead className="w-12">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentPageServers.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={14} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <p className="text-muted-foreground">
                            {statusFilter.length === 0
                              ? "Please select a status to filter."
                              : "No servers match the current filter."}
                          </p>
                          {statusFilter.length === 0 && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setStatusFilter([
                                  "Active",
                                  "Suspended",
                                  "Deleted",
                                ]);
                                setCurrentPage(1);
                              }}
                            >
                              Show All Servers
                            </Button>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    currentPageServers.map((server) => {
                      const daysUntilExpiry = calculateDaysUntilExpiry(
                        server.expiresAt
                      );
                      return (
                        <TableRow
                          key={server.identifier}
                          className={
                            server.status === "Deleted"
                              ? "dark:bg-zinc-800 opacity-60"
                              : ""
                          }
                        >
                          <TableCell>
                            <Checkbox
                              checked={selectedServers.has(server.id)}
                              disabled={server.status === "Deleted"}
                              onCheckedChange={(checked) =>
                                handleSelectServer(
                                  server.id,
                                  checked as boolean
                                )
                              }
                            />
                          </TableCell>
                          <TableCell
                            className={`font-mono ${
                              server.status === "Deleted"
                                ? "line-through text-gray-500"
                                : ""
                            }`}
                          >
                            {server.identifier}
                          </TableCell>
                          <TableCell
                            className={`font-medium ${
                              server.status === "Deleted"
                                ? "line-through text-gray-500"
                                : ""
                            }`}
                          >
                            {server.name || "Unnamed"}
                          </TableCell>
                          <TableCell
                            className={
                              server.status === "Deleted"
                                ? "line-through text-gray-500"
                                : ""
                            }
                          >
                            {server.resources.cpu}
                          </TableCell>
                          <TableCell
                            className={
                              server.status === "Deleted"
                                ? "line-through text-gray-500"
                                : ""
                            }
                          >
                            {server.resources.ram} MiB
                          </TableCell>
                          <TableCell
                            className={
                              server.status === "Deleted"
                                ? "line-through text-gray-500"
                                : ""
                            }
                          >
                            {server.resources.disk} MiB
                          </TableCell>
                          <TableCell
                            className={
                              server.status === "Deleted"
                                ? "line-through text-gray-500"
                                : ""
                            }
                          >
                            {server.resources.databases}
                          </TableCell>
                          <TableCell
                            className={
                              server.status === "Deleted"
                                ? "line-through text-gray-500"
                                : ""
                            }
                          >
                            {server.resources.allocations}
                          </TableCell>
                          <TableCell
                            className={
                              server.status === "Deleted"
                                ? "line-through text-gray-500"
                                : ""
                            }
                          >
                            {server.resources.backups}
                          </TableCell>
                          <TableCell>{getStatusBadge(server.status)}</TableCell>
                          <TableCell
                            className={
                              server.status === "Deleted" ? "opacity-50" : ""
                            }
                          >
                            <Badge
                              variant={
                                server.autoRenew ? "default" : "secondary"
                              }
                              className={
                                server.status === "Deleted"
                                  ? "line-through"
                                  : ""
                              }
                            >
                              {server.autoRenew ? "Enabled" : "Disabled"}
                            </Badge>
                          </TableCell>
                          <TableCell
                            className={
                              server.status === "Deleted"
                                ? "line-through text-gray-500"
                                : ""
                            }
                          >
                            {new Date(server.expiresAt).toLocaleDateString(
                              "zh-TW"
                            )}
                          </TableCell>
                          <TableCell
                            className={
                              server.status === "Deleted" ? "opacity-50" : ""
                            }
                          >
                            <Badge
                              variant={
                                daysUntilExpiry < 7
                                  ? "destructive"
                                  : daysUntilExpiry < 30
                                  ? "secondary"
                                  : "outline"
                              }
                              className={
                                server.status === "Deleted"
                                  ? "line-through"
                                  : ""
                              }
                            >
                              {daysUntilExpiry > 0
                                ? `${daysUntilExpiry} days`
                                : "Expired"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  disabled={server.status === "Deleted"}
                                  className={
                                    server.status === "Deleted"
                                      ? "opacity-50 cursor-not-allowed"
                                      : ""
                                  }
                                >
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleManageServer(server.identifier)
                                  }
                                  className="flex items-center gap-2"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                  Manage
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() =>
                                    handleRenewServer(server.identifier)
                                  }
                                  className="flex items-center gap-2"
                                >
                                  <ClockPlus className="h-4 w-4" />
                                  Renew
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleEditServer(server.id)}
                                  className="flex items-center gap-2"
                                >
                                  <Edit className="h-4 w-4" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteServer(server)}
                                  className="flex items-center gap-2 text-destructive"
                                >
                                  <Trash2 className="h-4 w-4" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mt-4">
                <div className="text-sm text-muted-foreground order-2 sm:order-1">
                  {`Showing ${
                    (currentPage - 1) * ITEMS_PER_PAGE + 1
                  } to ${Math.min(
                    currentPage * ITEMS_PER_PAGE,
                    filteredServers.length
                  )} of ${filteredServers.length} servers`}
                </div>
                <div className="flex items-center justify-center gap-2 order-1 sm:order-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.max(1, prev - 1))
                    }
                    disabled={currentPage === 1}
                    className="flex-shrink-0"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    <span className="hidden sm:inline">Previous</span>
                  </Button>
                  <span className="text-sm whitespace-nowrap">
                    {`Page ${currentPage} of ${totalPages}`}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                    }
                    disabled={currentPage === totalPages}
                    className="flex-shrink-0"
                  >
                    <span className="hidden sm:inline">Next</span>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Server</DialogTitle>
              <DialogDescription>
                {`Are you sure you want to delete server ${
                  serverToDelete?.identifier || ""
                }? This action cannot be undone.`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting && (
                  <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                )}
                {isDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog
          open={bulkDeleteDialogOpen}
          onOpenChange={setBulkDeleteDialogOpen}
        >
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Bulk Delete Servers</DialogTitle>
              <DialogDescription>
                {`Are you sure you want to delete ${selectedServers.size} selected servers? This action cannot be undone.`}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setBulkDeleteDialogOpen(false)}
                disabled={isBulkDeleting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={confirmBulkDelete}
                disabled={isBulkDeleting}
              >
                {isBulkDeleting && (
                  <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                )}
                {isBulkDeleting ? "Deleting..." : "Delete"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Edit Server - {serverToEdit?.name || "Unnamed"} (
                {serverToEdit?.identifier})
              </DialogTitle>
              <DialogDescription>
                Modify your servers resources and settings.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmitEdit)}
                className="space-y-6"
              >
                <div className="grid grid-cols-1 gap-4">
                  <FormField
                    control={form.control}
                    name="serverType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Server Type</FormLabel>
                        <FormDescription>
                          Select the type of server you want to create.
                        </FormDescription>
                        <Select
                          onValueChange={(value) => {
                            const [nestId, eggId] = value
                              .split(":")
                              .map(Number);
                            field.onChange(eggId);
                            form.setValue("nestId", nestId);
                          }}
                          value={
                            field.value && form.getValues("nestId")
                              ? `${form.getValues("nestId")}:${field.value}`
                              : undefined
                          }
                          disabled={isLoadingEggs}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue
                                placeholder={
                                  isLoadingEggs
                                    ? "Loading types..."
                                    : "Select a server type"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {nests.map((nest) => (
                              <SelectGroup key={nest.nestId}>
                                <SelectLabel>{nest.nestName}</SelectLabel>
                                {nest.eggs.map((egg) => (
                                  <SelectItem
                                    key={egg.eggId}
                                    value={`${nest.nestId}:${egg.eggId}`}
                                  >
                                    {egg.eggName}
                                  </SelectItem>
                                ))}
                              </SelectGroup>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Tabs defaultValue="resources" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-4">
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                    <TabsTrigger value="databases">Advanced</TabsTrigger>
                  </TabsList>

                  <TabsContent value="resources" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="cpu"
                      render={({ field }) => (
                        <FormItem className="bg-card p-4 rounded-lg border">
                          <div className="flex justify-between items-center">
                            <FormLabel className="text-base font-medium">
                              CPU
                            </FormLabel>
                            <Badge variant="secondary">
                              ${safeToFixed(pricing.cpu)} per %
                            </Badge>
                          </div>
                          <FormControl>
                            <div className="flex items-center gap-4">
                              <Slider
                                min={appConfig.limit.cpu.min}
                                max={appConfig.limit.cpu.max}
                                step={appConfig.limit.cpu.step}
                                value={[field.value]}
                                onValueChange={(values) =>
                                  field.onChange(values[0])
                                }
                                className="flex-1"
                              />
                              <span className="w-16 text-right font-medium">
                                {field.value}%
                              </span>
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs mt-2">
                            {`Additional cost: $${
                              isNaN(priceBreakdown.cpu)
                                ? "0.00"
                                : safeToFixed(priceBreakdown.cpu)
                            }`}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="ram"
                      render={({ field }) => (
                        <FormItem className="bg-card p-4 rounded-lg border">
                          <div className="flex justify-between items-center">
                            <FormLabel className="text-base font-medium">
                              Memory
                            </FormLabel>
                            <Badge variant="secondary">
                              ${safeToFixed(pricing.ram)} per MiB
                            </Badge>
                          </div>
                          <FormControl>
                            <div className="flex items-center gap-4">
                              <Slider
                                min={appConfig.limit.ram.min}
                                max={appConfig.limit.ram.max}
                                step={appConfig.limit.ram.step}
                                value={[field.value]}
                                onValueChange={(values) =>
                                  field.onChange(values[0])
                                }
                                className="flex-1"
                              />
                              <span className="w-16 text-right font-medium">
                                {field.value} MiB
                              </span>
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs mt-2">
                            {`Additional cost: $${
                              isNaN(priceBreakdown.ram)
                                ? "0.00"
                                : safeToFixed(priceBreakdown.ram)
                            }`}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="disk"
                      render={({ field }) => (
                        <FormItem className="bg-card p-4 rounded-lg border">
                          <div className="flex justify-between items-center">
                            <FormLabel className="text-base font-medium">
                              Disk
                            </FormLabel>
                            <Badge variant="secondary">
                              ${safeToFixed(pricing.disk)} per MiB
                            </Badge>
                          </div>
                          <FormControl>
                            <div className="flex items-center gap-4">
                              <Slider
                                min={appConfig.limit.disk.min}
                                max={appConfig.limit.disk.max}
                                step={appConfig.limit.disk.step}
                                value={[field.value]}
                                onValueChange={(values) =>
                                  field.onChange(values[0])
                                }
                                className="flex-1"
                              />
                              <span className="w-16 text-right font-medium">
                                {field.value} MiB
                              </span>
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs mt-2">
                            {`Additional cost: $${
                              isNaN(priceBreakdown.disk)
                                ? "0.00"
                                : safeToFixed(priceBreakdown.disk)
                            }`}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="autoRenew"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Auto Renew
                            </FormLabel>
                            <FormDescription>
                              Automatically renew your server before it expires.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="databases" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="databases"
                      render={({ field }) => (
                        <FormItem className="bg-card p-4 rounded-lg border">
                          <div className="flex justify-between items-center">
                            <FormLabel className="text-base font-medium">
                              Databases
                            </FormLabel>
                            <Badge variant="secondary">
                              ${safeToFixed(pricing.databases)} per database
                            </Badge>
                          </div>
                          <FormControl>
                            <div className="flex items-center gap-4">
                              <Slider
                                min={appConfig.limit.databases.min}
                                max={appConfig.limit.databases.max}
                                step={appConfig.limit.databases.step}
                                value={[field.value]}
                                onValueChange={(values) =>
                                  field.onChange(values[0])
                                }
                                className="flex-1"
                              />
                              <span className="w-16 text-right font-medium">
                                {field.value}
                              </span>
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs mt-2">
                            {`Additional cost: $${safeToFixed(
                              priceBreakdown.databases
                            )}`}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="allocations"
                      render={({ field }) => (
                        <FormItem className="bg-card p-4 rounded-lg border">
                          <div className="flex justify-between items-center">
                            <FormLabel className="text-base font-medium">
                              Allocations
                            </FormLabel>
                            <Badge variant="secondary">
                              ${safeToFixed(pricing.allocations)} per allocation
                            </Badge>
                          </div>
                          <FormControl>
                            <div className="flex items-center gap-4">
                              <Slider
                                min={appConfig.limit.allocations.min}
                                max={appConfig.limit.allocations.max}
                                step={appConfig.limit.allocations.step}
                                value={[field.value]}
                                onValueChange={(values) =>
                                  field.onChange(values[0])
                                }
                                className="flex-1"
                              />
                              <span className="w-16 text-right font-medium">
                                {field.value}
                              </span>
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs mt-2">
                            {`Additional cost: $${safeToFixed(
                              priceBreakdown.allocations
                            )}`}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="backups"
                      render={({ field }) => (
                        <FormItem className="bg-card p-4 rounded-lg border">
                          <div className="flex justify-between items-center">
                            <FormLabel className="text-base font-medium">
                              Backups
                            </FormLabel>
                            <Badge variant="secondary">
                              ${safeToFixed(pricing.backups)} per backup
                            </Badge>
                          </div>
                          <FormControl>
                            <div className="flex items-center gap-4">
                              <Slider
                                min={appConfig.limit.backups.min}
                                max={appConfig.limit.backups.max}
                                step={appConfig.limit.backups.step}
                                value={[field.value]}
                                onValueChange={(values) =>
                                  field.onChange(values[0])
                                }
                                className="flex-1"
                              />
                              <span className="w-16 text-right font-medium">
                                {field.value}
                              </span>
                            </div>
                          </FormControl>
                          <FormDescription className="text-xs mt-2">
                            {`Additional cost: $${safeToFixed(
                              priceBreakdown.backups
                            )}`}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>

                <div className="pt-4 w-full">
                  <div className="bg-muted/30 p-4 rounded-lg relative">
                    {isNaN(totalPrice) && (
                      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                        <div className="text-center p-6">
                          <h3 className="text-lg font-semibold mb-2">
                            Pricing Error
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Could not calculate the price. Please try again.
                          </p>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <div>
                        <h1 className="font-bold text-xl">Total Cost</h1>
                        <p className="text-sm text-muted-foreground">
                          This is the additional cost for the new resources.
                        </p>
                      </div>
                      <div
                        className={`text-2xl font-bold ${
                          hasEnoughDroplets()
                            ? "text-green-600"
                            : "text-red-600"
                        }`}
                      >
                        {isLoadingPricing
                          ? "Loading..."
                          : `${safeToFixed(totalPrice)} Droplets`}
                      </div>
                    </div>

                    <div className="border-t mt-4 pt-4">
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">Price Breakdown</span>
                        <span className="text-sm text-muted-foreground">
                          Cost for each resource
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-2 mt-2">
                        <div className="flex justify-between items-center">
                          <span>Base Price</span>
                          <span>${safeToFixed(priceBreakdown.base)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>{`CPU (${cpu}%)`}</span>
                          <span>${safeToFixed(priceBreakdown.cpu)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>{`Memory (${ram} MiB)`}</span>
                          <span>${safeToFixed(priceBreakdown.ram)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>{`Disk (${disk} MiB)`}</span>
                          <span>${safeToFixed(priceBreakdown.disk)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>{`Databases (${databases})`}</span>
                          <span>${safeToFixed(priceBreakdown.databases)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>{`Backups (${backups})`}</span>
                          <span>${safeToFixed(priceBreakdown.backups)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span>{`Allocations (${allocations})`}</span>
                          <span>
                            ${safeToFixed(priceBreakdown.allocations)}
                          </span>
                        </div>
                      </div>

                      <div className="flex justify-between items-center mt-4 pt-4 border-t">
                        <span className="font-semibold text-lg">
                          Total Modification Cost
                        </span>
                        <span className="font-bold text-lg text-primary">
                          ${safeToFixed(totalPrice)} Droplets
                        </span>
                      </div>

                      <div className="border-t mt-4 pt-4 space-y-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-muted-foreground">
                            Balance Change
                          </span>
                          <span className="font-medium">
                            {loading
                              ? "Loading..."
                              : !isNaN(totalPrice) && userInfo
                              ? `${safeToFixed(userInfo.coins)} → ${safeToFixed(
                                  getRemainingDroplets()
                                )} Droplets`
                              : "Calculating..."}
                          </span>
                        </div>

                        {!isNaN(totalPrice) && (
                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">
                              Status
                            </span>
                            <span
                              className={`font-medium ${
                                hasEnoughDroplets()
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {hasEnoughDroplets()
                                ? "Sufficient"
                                : "Insufficient"}
                            </span>
                          </div>
                        )}
                      </div>

                      {!hasEnoughDroplets() && !isNaN(totalPrice) && (
                        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-sm font-medium text-red-800">
                              Insufficient Balance
                            </span>
                          </div>
                          <p className="text-xs text-red-600 mt-1">
                            {`You need ${safeToFixed(
                              Math.abs(getRemainingDroplets())
                            )} more Droplets.`}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setEditDialogOpen(false)}
                    disabled={isModifying}
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={
                      isModifying ||
                      isLoadingEggs ||
                      !hasEnoughDroplets() ||
                      isNaN(totalPrice)
                    }
                  >
                    {isModifying && (
                      <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                    )}
                    {isModifying
                      ? "Modifying..."
                      : !hasEnoughDroplets()
                      ? "Insufficient Funds"
                      : "Save Changes"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        <Dialog open={renewDialogOpen} onOpenChange={setRenewDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Renew Server</DialogTitle>
              <DialogDescription>
                {`You are about to renew the server ${
                  serverToRenew?.name || "Unnamed"
                } (${
                  serverToRenew?.identifier || ""
                }). Please review the details below.`}
              </DialogDescription>
            </DialogHeader>

            {serverToRenew && (
              <div className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Server Information</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Name:
                      </span>
                      <p className="font-medium">
                        {serverToRenew.name || "Unnamed"}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">ID:</span>
                      <p className="font-medium font-mono">
                        {serverToRenew.identifier}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        CPU:
                      </span>
                      <p className="font-medium">
                        {serverToRenew.resources.cpu}%
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Memory:
                      </span>
                      <p className="font-medium">
                        {serverToRenew.resources.ram} MiB
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Disk:
                      </span>
                      <p className="font-medium">
                        {serverToRenew.resources.disk} MiB
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Databases:
                      </span>
                      <p className="font-medium">
                        {serverToRenew.resources.databases}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Allocations:
                      </span>
                      <p className="font-medium">
                        {serverToRenew.resources.allocations}
                      </p>
                    </div>
                    <div>
                      <span className="text-sm text-muted-foreground">
                        Backups:
                      </span>
                      <p className="font-medium">
                        {serverToRenew.resources.backups}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold mb-3">Pricing</h3>
                  <div className="flex justify-between items-center">
                    <span className="text-lg">Renewal Cost</span>
                    <span className="text-2xl font-bold text-primary">
                      {safeToFixed(renewCost)} Droplets
                    </span>
                  </div>

                  {userInfo && (
                    <div className="mt-4 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Current Balance
                        </span>
                        <span className="font-medium">
                          {safeToFixed(userInfo.coins)} Droplets
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">
                          Balance After Renewal
                        </span>
                        <span
                          className={`font-medium ${
                            userInfo.coins >= renewCost
                              ? "text-green-600"
                              : "text-red-600"
                          }`}
                        >
                          {safeToFixed(userInfo.coins - renewCost)} Droplets
                        </span>
                      </div>
                    </div>
                  )}

                  {userInfo && userInfo.coins < renewCost && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm font-medium text-red-800">
                          Insufficient Balance
                        </span>
                      </div>
                      <p className="text-xs text-red-600 mt-1">
                        {`You need ${safeToFixed(
                          renewCost - userInfo.coins
                        )} more Droplets to renew.`}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setRenewDialogOpen(false)}
                disabled={isRenewing}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmRenew}
                disabled={isRenewing || !userInfo || userInfo.coins < renewCost}
              >
                {isRenewing && (
                  <LoaderCircle className="h-4 w-4 mr-2 animate-spin" />
                )}
                {isRenewing
                  ? "Renewing..."
                  : !userInfo || userInfo.coins < renewCost
                  ? "Insufficient Funds"
                  : "Confirm Renewal"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </>
  );
}

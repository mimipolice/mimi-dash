"use client";

import { useState, useEffect } from "react";
import { useTransitionRouter } from "next-view-transitions";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import toast from "react-hot-toast";
import axios from "axios";
import { Button } from "@/components/ui/button";
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
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import appConfig from "@/config";
const formSchema = z.object({
  name: z.string().min(2, {
    message: "Server name must be at least 2 characters.",
  }),
  serverType: z.number({
    message: "Please select a server type.",
  }),
  nestId: z.number({
    message: "Please select a server type.",
  }),
  locationId: z.number({
    message: "Please select a location.",
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

interface UserInfo {
  coins: number;
  panelId: number;
}

const DEFAULT_PRICING: ResourcePricing = {
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

export default function DashboardServersCreate() {
  const router = useTransitionRouter();
  const [pricing, setPricing] = useState<ResourcePricing>(DEFAULT_PRICING);
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
  const [isLoadingPricing, setIsLoadingPricing] = useState(true);
  const [nests, setNests] = useState<Nest[]>([]);
  const [isLoadingEggs, setIsLoadingEggs] = useState(true);
  const [locations, setLocations] = useState<Location[]>([]);
  const [isLoadingLocations, setIsLoadingLocations] = useState(true);
  const [isCreatingServer, setIsCreatingServer] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoadingUserInfo, setIsLoadingUserInfo] = useState(true);
  const [serviceStatus, setServiceStatus] = useState<boolean>(true);
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      serverType: undefined,
      nestId: undefined,
      locationId: undefined,
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

  useEffect(() => {
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
          toast.error("Error fetching pricing information.");
        }
      } catch (error) {
        console.error("Error fetching pricing:", error);
        setPricing(DEFAULT_PRICING);
        toast.error("Error fetching pricing information.");
      } finally {
        setIsLoadingPricing(false);
      }
    };

    fetchPricing();
  }, []);

  useEffect(() => {
    const fetchUserInfo = async () => {
      try {
        setIsLoadingUserInfo(true);
        const response = await axios.get("/api/userinfo");
        setUserInfo(response.data);
      } catch (error) {
        console.error("Failed to fetch user info:", error);
        toast.error("Failed to fetch user information.");
      } finally {
        setIsLoadingUserInfo(false);
      }
    };

    fetchUserInfo();
  }, []);

  useEffect(() => {
    const fetchServiceStatus = async () => {
      try {
        setIsLoadingStatus(true);
        const response = await axios.get("/api/status");
        setServiceStatus(response.data.status);
      } catch (error) {
        console.error("Failed to fetch service status:", error);
        setServiceStatus(false);
      } finally {
        setIsLoadingStatus(false);
      }
    };

    fetchServiceStatus();
  }, []);

  useEffect(() => {
    const fetchEggs = async () => {
      try {
        setIsLoadingEggs(true);
        const response = await axios.get("/api/eggs");

        if (
          response.data.status === "success" &&
          Array.isArray(response.data.data)
        ) {
          setNests(response.data.data);
        } else {
          console.error("Invalid eggs data format:", response.data);
          toast.error("Error loading server types.");
        }
      } catch (error) {
        console.error("Error fetching eggs:", error);
        toast.error("Error loading server types.");
      } finally {
        setIsLoadingEggs(false);
      }
    };

    fetchEggs();
  }, []);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        setIsLoadingLocations(true);
        const response = await axios.get("/api/locations");

        if (
          response.data.status === "success" &&
          Array.isArray(response.data.data)
        ) {
          setLocations(response.data.data);
        } else {
          console.error("Invalid locations data format:", response.data);
          toast.error("Error loading locations.");
        }
      } catch (error) {
        console.error("Error fetching locations:", error);
        toast.error("Error loading locations.");
      } finally {
        setIsLoadingLocations(false);
      }
    };

    fetchLocations();
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

      const breakdown = {
        base: baseCost,
        cpu: cpuCost,
        ram: ramCost,
        disk: diskCost,
        databases: databasesCost,
        backups: backupsCost,
        allocations: allocationsCost,
      };

      setPriceBreakdown(breakdown);

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
  ]);

  const hasEnoughDroplets = () => {
    if (!userInfo || isNaN(totalPrice)) return false;
    return userInfo.coins >= totalPrice;
  };

  const getRemainingDroplets = () => {
    if (!userInfo || isNaN(totalPrice)) return 0;
    return userInfo.coins - totalPrice;
  };

  const getExpirationDate = () => {
    const now = new Date();
    const expirationDate = new Date(now);
    expirationDate.setMonth(now.getMonth() + 1);

    const timeDiff = expirationDate.getTime() - now.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const year = expirationDate.getFullYear();
    const month = expirationDate.getMonth() + 1;
    const day = expirationDate.getDate();

    return {
      formatted: `${year}/${month}/${day}`,
      daysRemaining,
    };
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log({
      ...values,
      totalPrice,
      priceBreakdown,
    });

    const createServer = async () => {
      let loadingToast;
      try {
        setIsCreatingServer(true);

        loadingToast = toast.loading(`Creating server ${values.name}...`, {
          duration: Infinity,
        });

        const response = await axios.post("/api/servers", {
          name: values.name,
          locationId: values.locationId,
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
            `${values.name} created successfully for ${safeToFixed(
              totalPrice
            )} Droplets.`,
            {
              duration: 4000,
            }
          );

          setTimeout(() => {
            router.push("/dashboard/servers/manage");
          }, 1500);
        } else {
          toast.error(response.data.error || "Failed to create server.");
        }
      } catch (error) {
        console.error("Error creating server:", error);
        if (loadingToast) {
          toast.dismiss(loadingToast);
        }

        if (axios.isAxiosError(error)) {
          if (
            error.response?.status === 400 &&
            error.response?.data?.error.errors[0].code ==
              "NoViableNodeException"
          ) {
            toast.error(
              "The selected node is full, please try another location."
            );
          } else {
            toast.error(
              error.response?.data?.error || "Failed to create server."
            );
          }
        } else {
          toast.error("Failed to create server.");
        }
      } finally {
        setIsCreatingServer(false);
      }
    };

    createServer();
  }

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
                <BreadcrumbPage>Create</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>
      <div className="container mx-auto py-10 px-5">
        <Card className="max-w-3xl mx-auto border-2 border-border/50 shadow-md">
          <CardHeader className="bg-muted/30 py-5">
            <div className="flex justify-between items-center">
              <div>
                <CardTitle className="text-2xl font-bold">
                  Create a New Server
                </CardTitle>
                <CardDescription className="text-sm mt-2">
                  Configure and launch your server.
                </CardDescription>
              </div>
              <Badge
                variant="outline"
                className="text-lg py-2 px-4 bg-primary/10 text-center flex flex-col"
              >
                {isLoadingStatus ? (
                  <span className="font-semibold text-gray-500">
                    - Checking Status -
                  </span>
                ) : serviceStatus ? (
                  <span className="font-semibold text-green-500">
                    - Service Available -
                  </span>
                ) : (
                  <span className="font-semibold text-red-500">
                    - Service Suspended -
                  </span>
                )}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          Server Name
                        </FormLabel>
                        <FormControl>
                          <Input
                            placeholder="My Awesome Server"
                            className="h-10"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription className="text-xs">
                          Choose a name for your server.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="locationId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          Location
                        </FormLabel>
                        <Select
                          onValueChange={(value) =>
                            field.onChange(Number(value))
                          }
                          value={field.value?.toString()}
                          disabled={isLoadingLocations}
                        >
                          <FormControl>
                            <SelectTrigger className="h-10">
                              <SelectValue
                                placeholder={
                                  isLoadingLocations
                                    ? "Loading locations..."
                                    : "Select a location"
                                }
                              />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {locations.map((location) => (
                              <SelectItem
                                key={location.attributes.id}
                                value={location.attributes.id.toString()}
                              >
                                {location.attributes.short}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription className="text-xs">
                          Choose the servers physical location.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="serverType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-medium">
                          Server Type
                        </FormLabel>
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
                            <SelectTrigger className="h-10">
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
                        <FormDescription className="text-xs">
                          Select the type of server you want to create.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <Tabs defaultValue="resources" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-6">
                    <TabsTrigger value="resources" className="text-sm">
                      Resources
                    </TabsTrigger>
                    <TabsTrigger value="databases" className="text-sm">
                      Advanced
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="resources" className="space-y-6">
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
                            <Input
                              type="number"
                              min={appConfig.limit.cpu.min}
                              max={appConfig.limit.cpu.max}
                              step={appConfig.limit.cpu.step}
                              className="w-full h-10"
                              placeholder="e.g., 100"
                              value={field.value}
                              onChange={(e) => {
                                const inputValue = e.target.value;
                                if (inputValue === "") {
                                  return;
                                }
                                const value = Number(inputValue);
                                if (!isNaN(value)) {
                                  field.onChange(value);
                                }
                              }}
                              onBlur={() => {
                                const currentValue = field.value;
                                const value = Number(currentValue);
                                if (
                                  isNaN(value) ||
                                  value < appConfig.limit.cpu.min
                                ) {
                                  field.onChange(appConfig.limit.cpu.min);
                                } else if (value > appConfig.limit.cpu.max) {
                                  field.onChange(appConfig.limit.cpu.max);
                                }
                              }}
                            />
                          </FormControl>
                          <FormDescription className="text-xs mt-2">
                            Additional cost: $
                            {isNaN(priceBreakdown.cpu)
                              ? "0.00"
                              : safeToFixed(priceBreakdown.cpu)}{" "}
                            Droplets
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
                            <Input
                              type="number"
                              min={appConfig.limit.ram.min}
                              max={appConfig.limit.ram.max}
                              step={appConfig.limit.ram.step}
                              className="w-full h-10"
                              placeholder="e.g., 1024"
                              value={field.value}
                              onChange={(e) => {
                                const inputValue = e.target.value;
                                if (inputValue === "") {
                                  return;
                                }
                                const value = Number(inputValue);
                                if (!isNaN(value)) {
                                  field.onChange(value);
                                }
                              }}
                              onBlur={() => {
                                const currentValue = field.value;
                                const value = Number(currentValue);
                                if (
                                  isNaN(value) ||
                                  value < appConfig.limit.ram.min
                                ) {
                                  field.onChange(appConfig.limit.ram.min);
                                } else if (value > appConfig.limit.ram.max) {
                                  field.onChange(appConfig.limit.ram.max);
                                }
                              }}
                            />
                          </FormControl>
                          <FormDescription className="text-xs mt-2">
                            Additional cost: $
                            {isNaN(priceBreakdown.ram)
                              ? "0.00"
                              : safeToFixed(priceBreakdown.ram)}{" "}
                            Droplets
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
                            <Input
                              type="number"
                              min={appConfig.limit.disk.min}
                              max={appConfig.limit.disk.max}
                              step={appConfig.limit.disk.step}
                              className="w-full h-10"
                              placeholder="e.g., 5120"
                              value={field.value}
                              onChange={(e) => {
                                const inputValue = e.target.value;
                                if (inputValue === "") {
                                  return;
                                }
                                const value = Number(inputValue);
                                if (!isNaN(value)) {
                                  field.onChange(value);
                                }
                              }}
                              onBlur={() => {
                                const currentValue = field.value;
                                const value = Number(currentValue);
                                if (
                                  isNaN(value) ||
                                  value < appConfig.limit.disk.min
                                ) {
                                  field.onChange(appConfig.limit.disk.min);
                                } else if (value > appConfig.limit.disk.max) {
                                  field.onChange(appConfig.limit.disk.max);
                                }
                              }}
                            />
                          </FormControl>
                          <FormDescription className="text-xs mt-2">
                            Additional cost: $
                            {isNaN(priceBreakdown.disk)
                              ? "0.00"
                              : safeToFixed(priceBreakdown.disk)}{" "}
                            Droplets
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="autoRenew"
                      render={({ field }) => (
                        <FormItem className="bg-card p-4 rounded-lg border">
                          <div className="flex items-center justify-between">
                            <div className="space-y-0.5">
                              <FormLabel className="text-base font-medium">
                                Auto Renew
                              </FormLabel>
                              <FormDescription className="text-xs">
                                Automatically renew your server before it
                                expires.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>

                  <TabsContent value="databases" className="space-y-6">
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
                                defaultValue={[field.value]}
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
                            Additional cost: $
                            {safeToFixed(priceBreakdown.databases)} Droplets
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
                                defaultValue={[field.value]}
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
                            Additional cost: $
                            {safeToFixed(priceBreakdown.allocations)} Droplets
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
                                defaultValue={[field.value]}
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
                            Additional cost: $
                            {safeToFixed(priceBreakdown.backups)} Droplets
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>

                <div className="pt-4 w-full">
                  <div className="flex flex-col gap-10">
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
                            This is the total cost for the new server.
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
                            <span className="text-yellow-600">
                              ${safeToFixed(priceBreakdown.base)}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span>CPU ({cpu}%):</span>
                            <span className="text-yellow-600">
                              ${safeToFixed(priceBreakdown.cpu)}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span>Memory ({ram} MiB):</span>
                            <span className="text-yellow-600">
                              ${safeToFixed(priceBreakdown.ram)}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span>Disk ({disk} MiB):</span>
                            <span className="text-yellow-600">
                              ${safeToFixed(priceBreakdown.disk)}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span>Databases ({databases}):</span>
                            <span className="text-yellow-600">
                              ${safeToFixed(priceBreakdown.databases)}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span>Backups ({backups}):</span>
                            <span className="text-yellow-600">
                              ${safeToFixed(priceBreakdown.backups)}
                            </span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span>Allocations ({allocations}):</span>
                            <span className="text-yellow-600">
                              ${safeToFixed(priceBreakdown.allocations)}
                            </span>
                          </div>
                        </div>

                        <div className="flex justify-between items-center mt-4 pt-4 border-t">
                          <span className="font-semibold text-lg">
                            Total Cost
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
                              {isLoadingUserInfo
                                ? "Loading..."
                                : !isNaN(totalPrice) && userInfo
                                ? `${safeToFixed(
                                    userInfo.coins
                                  )} → ${safeToFixed(
                                    getRemainingDroplets()
                                  )} Droplets`
                                : `${safeToFixed(
                                    userInfo?.coins ?? 0
                                  )} Droplets`}
                            </span>
                          </div>

                          {!isLoadingUserInfo &&
                            userInfo &&
                            !isNaN(totalPrice) && (
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

                          <div className="flex justify-between items-center text-sm">
                            <span className="text-muted-foreground">
                              Expiration Date
                            </span>
                            <span className="font-medium text-blue-600">
                              {getExpirationDate().formatted} (
                              {getExpirationDate().daysRemaining}
                              days remaining)
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <Button
                      type="submit"
                      className="w-full h-12 text-base font-medium"
                      disabled={
                        isLoadingPricing ||
                        isLoadingLocations ||
                        isLoadingUserInfo ||
                        isLoadingStatus ||
                        isCreatingServer ||
                        totalPrice <= 0 ||
                        isNaN(totalPrice) ||
                        !hasEnoughDroplets() ||
                        !serviceStatus
                      }
                    >
                      {isLoadingPricing ||
                      isLoadingLocations ||
                      isLoadingUserInfo ||
                      isLoadingStatus
                        ? "Loading..."
                        : isCreatingServer
                        ? "Creating..."
                        : !serviceStatus
                        ? "Service Suspended"
                        : isNaN(totalPrice)
                        ? "Please complete the form"
                        : !hasEnoughDroplets()
                        ? "Insufficient Balance"
                        : `Create Server - ${safeToFixed(totalPrice)} Droplets`}
                    </Button>
                  </div>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </>
  );
}

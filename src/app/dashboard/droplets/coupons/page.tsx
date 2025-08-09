"use client";
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
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Key, Gift, Droplets } from "lucide-react";
import { Cover } from "@/components/ui/cover";
interface RedeemResponse {
  status: "success" | "error";
  coins?: number;
  added?: number;
  errors?: string[];
}

export default function CouponsPage() {
  const [couponCode, setCouponCode] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [successDialog, setSuccessDialog] = useState<{
    open: boolean;
    code: string;
    added: number;
    totalCoins: number;
  }>({
    open: false,
    code: "",
    added: 0,
    totalCoins: 0,
  });

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!couponCode.trim()) {
      toast.error("Please enter a coupon code.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post<RedeemResponse>("/api/redeem", {
        code: couponCode.trim(),
      });

      const data = response.data;

      if (
        data.status === "success" &&
        data.coins !== undefined &&
        data.added !== undefined
      ) {
        setSuccessDialog({
          open: true,
          code: couponCode,
          added: data.added,
          totalCoins: data.coins,
        });
        setCouponCode("");
      } else {
        toast.error("Failed to redeem coupon.");
      }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response?.data) {
        const errorData = error.response.data as RedeemResponse;

        if (errorData.errors && errorData.errors.length > 0) {
          const errorMessage = errorData.errors[0];

          if (errorMessage === "Coupon already used by this user") {
            toast.error("You have already used this coupon.");
          } else if (errorMessage === "Coupon not found") {
            toast.error("Coupon code not found.");
          } else if (errorMessage === "Coupon usage limit reached") {
            toast.error("This coupon has reached its usage limit.");
          } else {
            toast.error("Failed to redeem coupon.");
          }
        } else {
          toast.error("Failed to redeem coupon.");
        }
      } else {
        toast.error("Failed to redeem coupon.");
      }
    } finally {
      setIsLoading(false);
    }
  };

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
                <BreadcrumbLink href="/dashboard">Droplets</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="hidden md:block" />
              <BreadcrumbItem>
                <BreadcrumbPage>Coupons</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>
      </header>

      <div className="flex flex-1 flex-col gap-6 p-6 pt-0">
        <div className="mx-auto w-full max-w-4xl">
          <Card className="border border-border shadow-2xl bg-card">
            <CardHeader className="text-center pb-8 pt-12">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary/10 shadow-lg border border-primary/20">
                <Gift className="h-10 w-10 text-primary" />
              </div>
              <CardTitle className="text-3xl font-bold text-primary">
                Redeem a Coupon
              </CardTitle>
              <CardDescription className="text-lg mt-3 max-w-md mx-auto text-muted-foreground">
                Enter your coupon code below to claim your reward.
              </CardDescription>
            </CardHeader>
            <CardContent className="px-12 pb-12">
              <form onSubmit={handleRedeem} className="space-y-8">
                <div className="space-y-4">
                  <Label
                    htmlFor="coupon-code"
                    className="text-lg font-medium text-foreground"
                  >
                    Coupon Code
                  </Label>
                  <div className="relative">
                    <Input
                      id="coupon-code"
                      type="text"
                      placeholder="Enter your code"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      disabled={isLoading}
                      className="text-center text-xl font-mono h-14 border-2 focus:border-primary bg-background shadow-inner transition-all duration-200 hover:bg-muted/30"
                    />
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                      <Key className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </div>
                <Cover className="w-full block">
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full h-14 text-lg font-semibold bg-primary hover:bg-primary/90 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:transform-none disabled:opacity-50"
                    disabled={isLoading || !couponCode.trim()}
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-3">
                        <div className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        <span>Redeeming...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-3">
                        <Gift className="h-5 w-5" />
                        <span>Redeem</span>
                      </div>
                    )}
                  </Button>
                </Cover>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      <Dialog
        open={successDialog.open}
        onOpenChange={(open) => setSuccessDialog((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="sm:max-w-lg border shadow-2xl bg-card">
          <DialogHeader>
            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/40 shadow-xl border border-green-200 dark:border-green-800">
              <Gift className="h-10 w-10 text-green-600 dark:text-green-400" />
            </div>
            <DialogTitle className="text-center text-2xl font-bold text-green-600 dark:text-green-400">
              Success!
            </DialogTitle>
            <DialogDescription className="text-center text-base mt-2">
              You have successfully redeemed the coupon.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6 pt-4">
            <div className="rounded-xl bg-green-50 dark:bg-green-900/20 p-6 text-center border border-green-200 dark:border-green-800 shadow-inner">
              <div className="text-sm font-medium text-green-700 dark:text-green-300 mb-2">
                Reward Received
              </div>
              <div className="text-3xl font-bold text-green-600 dark:text-green-400 flex items-center justify-center gap-2">
                <Droplets className="h-7 w-7" />+
                {successDialog.added.toFixed(2)} Droplets
              </div>
            </div>
            <div className="rounded-xl border-2 border-dashed border-muted-foreground/20 p-6 text-center bg-muted/30">
              <div className="text-sm font-medium text-muted-foreground mb-2">
                Your New Balance
              </div>
              <div className="text-2xl font-bold flex items-center justify-center gap-2">
                <Droplets className="h-6 w-6" />
                {successDialog.totalCoins.toFixed(2)} Droplets
              </div>
            </div>
            <Button
              onClick={() =>
                setSuccessDialog((prev) => ({ ...prev, open: false }))
              }
              size="lg"
              className="w-full h-12 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02]"
            >
              <div className="flex items-center gap-2">
                <span>🎉</span>
              </div>
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

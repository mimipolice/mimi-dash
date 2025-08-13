export type Coupon = {
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

export interface CouponUsageDetails {
  id: string;
  user_id: string;
  used_at: string;
  user_name: string;
}

export interface CouponUsageStatistics {
  total_used: string;
  unique_users: string;
  first_used: string;
  last_used: string;
  remaining_uses: string;
}

export interface CouponUsageData {
  coupon: Coupon;
  usage_details: CouponUsageDetails[];
  statistics: CouponUsageStatistics;
}

export async function fetchCoupons(): Promise<Coupon[]> {
  console.log("Fetching coupons...");
  const response = await fetch("/api/admin/coupons");
  console.log("Fetch response status:", response.status);
  if (!response.ok) {
    throw new Error("Failed to fetch coupons");
  }
  const result = await response.json();
  console.log("Coupons data from API:", result.data);
  return result.data;
}

export async function createCoupon(
  data: Omit<
    Coupon,
    "id" | "is_active" | "created_at" | "updated_at" | "actual_used_count"
  >
) {
  const response = await fetch("/api/admin/coupons", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error.message);
  }
  return response.json();
}

export async function updateCoupon(data: Partial<Coupon> & { id: string }) {
  const response = await fetch(`/api/admin/coupons`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error.message);
  }
  return response.json();
}

export async function fetchCouponUsage(id: string): Promise<CouponUsageData> {
  const response = await fetch(`/api/admin/coupons/${id}/usage`);
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error.message);
  }
  const result = await response.json();
  return result.data;
}

export async function deleteCoupon(id: string) {
  const response = await fetch(`/api/admin/coupons/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error.message);
  }
  return response.json();
}

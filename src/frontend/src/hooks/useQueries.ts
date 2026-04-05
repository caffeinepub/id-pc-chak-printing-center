/**
 * useQueries.ts
 * React Query hooks for reading shared data from the ICP backend.
 * Uses localStorage as initial data / fallback.
 * All queries poll the backend every 5 seconds so admin changes
 * are reflected on the live site in near real-time across all devices.
 */

import {
  type Company,
  type BillingCustomer as FEBillingCustomer,
  fetchAboutStats,
  fetchApprovedReviews,
  fetchBannerImage,
  fetchBillingCustomers,
  fetchBillingItems,
  fetchCompanies,
  fetchContactMessages,
  fetchEmployees,
  fetchGallery,
  fetchInvoices,
  fetchLogo,
  fetchOrders,
  fetchPendingReviews,
  fetchReviews,
  fetchServices,
  fetchVisionMission,
} from "@/lib/backendData";
import {
  type BillingItem,
  type Review,
  getBannerImage,
  getBillingItems,
  getContactMessages,
  getEmployees,
  getInvoices,
  getLogo,
  getOrders,
  getReviews,
  getServices,
} from "@/lib/storage";

// Re-export types needed by consumers
export type { FEBillingCustomer as BillingCustomer, Company };
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useActor } from "./useActor";

// Poll interval: how often the live site re-fetches from the backend (ms)
const POLL_INTERVAL = 5_000;

export function useLogo() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["logo"],
    queryFn: () => fetchLogo(actor),
    enabled: !isFetching,
    initialData: getLogo,
    staleTime: 0,
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: true,
  });
}

export function useBannerImage() {
  const { actor, isFetching } = useActor();
  return useQuery<string>({
    queryKey: ["bannerImage"],
    queryFn: () => fetchBannerImage(actor),
    enabled: !isFetching,
    initialData: getBannerImage,
    staleTime: 0,
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: true,
  });
}

export function useServices() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["services"],
    queryFn: () => fetchServices(actor),
    enabled: !isFetching,
    initialData: getServices,
    staleTime: 0,
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: true,
  });
}

export function useEmployees() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["employees"],
    queryFn: () => fetchEmployees(actor),
    enabled: !isFetching,
    initialData: getEmployees,
    staleTime: 0,
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: true,
  });
}

export function useReviews() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["reviews"],
    queryFn: () => fetchReviews(actor),
    enabled: !isFetching,
    initialData: getReviews,
    staleTime: 0,
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: true,
  });
}

export function useApprovedReviews() {
  const { actor, isFetching } = useActor();
  return useQuery<Review[]>({
    queryKey: ["approvedReviews"],
    queryFn: () => fetchApprovedReviews(actor),
    enabled: !isFetching,
    initialData: () =>
      getReviews().filter((r) => !r.status || r.status === "approved"),
    staleTime: 0,
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: true,
  });
}

export function usePendingReviews() {
  const { actor, isFetching } = useActor();
  return useQuery<Review[]>({
    queryKey: ["pendingReviews"],
    queryFn: () => fetchPendingReviews(actor),
    enabled: !isFetching,
    initialData: () => getReviews().filter((r) => r.status === "pending"),
    staleTime: 0,
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: true,
  });
}

export function useInvoices() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["invoices"],
    queryFn: () => fetchInvoices(actor),
    enabled: !isFetching,
    initialData: getInvoices,
    staleTime: 0,
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: true,
  });
}

export function useOrders() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["orders"],
    queryFn: () => fetchOrders(actor),
    enabled: !isFetching,
    initialData: getOrders,
    staleTime: 0,
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: true,
  });
}

export function useContactMessages() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["contactMessages"],
    queryFn: () => fetchContactMessages(actor),
    enabled: !isFetching,
    initialData: getContactMessages,
    staleTime: 0,
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: true,
  });
}

export function useBillingItems() {
  const { actor, isFetching } = useActor();
  return useQuery<BillingItem[]>({
    queryKey: ["billingItems"],
    queryFn: () => fetchBillingItems(actor),
    enabled: !isFetching,
    initialData: getBillingItems,
    staleTime: 0,
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: true,
  });
}

export function useAboutStats() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["aboutStats"],
    queryFn: () => fetchAboutStats(actor),
    enabled: !isFetching,
    initialData: () => ({
      yearsExperience: localStorage.getItem("idpc_years_experience") || "10+",
      numClients: localStorage.getItem("idpc_num_clients") || "1000+",
    }),
    staleTime: 0,
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: true,
  });
}

export function useCompanies() {
  const { actor, isFetching } = useActor();
  return useQuery<Company[]>({
    queryKey: ["companies"],
    queryFn: () => fetchCompanies(actor),
    enabled: !isFetching,
    initialData: () => {
      const data = localStorage.getItem("idpc_companies");
      return data ? JSON.parse(data) : [];
    },
    staleTime: 0,
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: true,
  });
}

export function useBillingCustomers() {
  const { actor, isFetching } = useActor();
  return useQuery<FEBillingCustomer[]>({
    queryKey: ["billingCustomers"],
    queryFn: () => fetchBillingCustomers(actor),
    enabled: !isFetching,
    initialData: () => {
      const data = localStorage.getItem("idpc_billing_customers");
      if (!data) return [];
      const parsed: FEBillingCustomer[] = JSON.parse(data);
      return parsed.map((c) => ({ ...c, address: c.address ?? "" }));
    },
    staleTime: 0,
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: true,
  });
}

export function useGallery() {
  const { actor, isFetching } = useActor();
  return useQuery<string[]>({
    queryKey: ["gallery"],
    queryFn: () => fetchGallery(actor),
    enabled: !isFetching,
    initialData: (): string[] => {
      try {
        const raw = localStorage.getItem("idpc_extended_data");
        if (raw) {
          const parsed = JSON.parse(raw);
          return parsed.gallery || [];
        }
      } catch {
        // ignore
      }
      return [];
    },
    staleTime: 0,
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: true,
  });
}

export function useVisionMission() {
  const { actor, isFetching } = useActor();
  return useQuery<{ vision: string; mission: string }>({
    queryKey: ["visionMission"],
    queryFn: () => fetchVisionMission(actor),
    enabled: !isFetching,
    initialData: (): { vision: string; mission: string } => {
      try {
        const raw = localStorage.getItem("idpc_extended_data");
        if (raw) {
          const parsed = JSON.parse(raw);
          return { vision: parsed.vision || "", mission: parsed.mission || "" };
        }
      } catch {
        // ignore
      }
      return { vision: "", mission: "" };
    },
    staleTime: 0,
    refetchInterval: POLL_INTERVAL,
    refetchIntervalInBackground: true,
  });
}

/**
 * Hook to get the queryClient for cache invalidation after writes.
 * Usage: const invalidate = useInvalidate(); invalidate(["employees"]);
 */
export function useInvalidate() {
  const qc = useQueryClient();
  return (keys: string[]) => {
    for (const k of keys) {
      qc.invalidateQueries({ queryKey: [k] });
    }
  };
}

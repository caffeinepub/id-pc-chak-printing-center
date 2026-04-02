/**
 * useQueries.ts
 * React Query hooks for reading shared data from the ICP backend.
 * Uses localStorage as initial data / fallback.
 * All queries poll the backend every 5 seconds so admin changes
 * are reflected on the live site in near real-time across all devices.
 */

import {
  fetchBannerImage,
  fetchContactMessages,
  fetchEmployees,
  fetchInvoices,
  fetchLogo,
  fetchOrders,
  fetchReviews,
  fetchServices,
} from "@/lib/backendData";
import {
  getBannerImage,
  getContactMessages,
  getEmployees,
  getInvoices,
  getLogo,
  getOrders,
  getReviews,
  getServices,
} from "@/lib/storage";
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

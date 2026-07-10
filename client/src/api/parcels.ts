import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { api } from "@/lib/apiClient";
import type {
  Dimensions,
  ItemResponse,
  ListResponse,
  Location,
  Parcel,
  ParcelStatus,
  ParcelType,
  PaymentStatus,
  Recipient,
  TrackingInfo,
} from "@/types/api";

export interface ParcelListParams {
  page?: number;
  limit?: number;
  status?: ParcelStatus;
  parcelType?: ParcelType;
}

export interface CreateParcelPayload {
  parcelType: ParcelType;
  weight: number;
  description?: string;
  dimensions?: Dimensions;
  locationFrom: Location;
  locationTo: Location;
  presentLocation?: Location;
  notes?: string;
  recipient: Recipient;
}

export const parcelKeys = {
  all: ["parcels"] as const,
  list: (params: ParcelListParams) => ["parcels", "list", params] as const,
  detail: (id: string) => ["parcels", "detail", id] as const,
  track: (code: string) => ["parcels", "track", code] as const,
};

export const parcelsApi = {
  list: (params: ParcelListParams) =>
    api.get<ListResponse<Parcel>>("/parcels", { params }).then((r) => r.data),
  get: (id: string) =>
    api.get<ItemResponse<Parcel>>(`/parcels/${id}`).then((r) => r.data.data),
  track: (code: string) =>
    api
      .get<ItemResponse<TrackingInfo>>(`/parcels/track/${code}`)
      .then((r) => r.data.data),
  create: (payload: CreateParcelPayload) =>
    api.post<ItemResponse<Parcel>>("/parcels", payload).then((r) => r.data.data),
  cancel: (id: string) =>
    api
      .put<ItemResponse<Parcel>>(`/parcels/${id}/cancel`)
      .then((r) => r.data.data),
  updateDestination: (id: string, locationTo: Location) =>
    api
      .put<ItemResponse<Parcel>>(`/parcels/${id}/destination`, { locationTo })
      .then((r) => r.data.data),
  updateStatus: (
    id: string,
    body: { status?: ParcelStatus; paymentStatus?: PaymentStatus },
  ) =>
    api
      .put<ItemResponse<Parcel>>(`/parcels/${id}/status`, body)
      .then((r) => r.data.data),
  updatePresentLocation: (id: string, presentLocation: Location) =>
    api
      .put<ItemResponse<Parcel>>(`/parcels/${id}/presentLocation`, {
        presentLocation,
      })
      .then((r) => r.data.data),
  assignCourier: (id: string, courierId: string) =>
    api
      .put<ItemResponse<Parcel>>(`/parcels/${id}/assign`, { courierId })
      .then((r) => r.data.data),
};

export function useParcels(params: ParcelListParams) {
  return useQuery({
    queryKey: parcelKeys.list(params),
    queryFn: () => parcelsApi.list(params),
  });
}

export function useParcel(id: string | undefined) {
  return useQuery({
    queryKey: parcelKeys.detail(id ?? ""),
    queryFn: () => parcelsApi.get(id!),
    enabled: Boolean(id),
  });
}

export function useTrackParcel(code: string) {
  return useQuery({
    queryKey: parcelKeys.track(code),
    queryFn: () => parcelsApi.track(code),
    enabled: code.trim().length > 0,
    retry: false,
  });
}

export function useCreateParcel() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: parcelsApi.create,
    onSuccess: () => qc.invalidateQueries({ queryKey: parcelKeys.all }),
  });
}

/** Shared invalidation for the various single-parcel mutations. */
function useParcelMutation<TArgs>(
  fn: (args: TArgs) => Promise<Parcel>,
  idOf: (args: TArgs) => string,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: (_data, args) => {
      qc.invalidateQueries({ queryKey: parcelKeys.detail(idOf(args)) });
      qc.invalidateQueries({ queryKey: parcelKeys.all });
    },
  });
}

export function useCancelParcel() {
  return useParcelMutation(
    (id: string) => parcelsApi.cancel(id),
    (id) => id,
  );
}

export function useUpdateDestination() {
  return useParcelMutation(
    (args: { id: string; locationTo: Location }) =>
      parcelsApi.updateDestination(args.id, args.locationTo),
    (args) => args.id,
  );
}

export function useUpdateStatus() {
  return useParcelMutation(
    (args: { id: string; status?: ParcelStatus; paymentStatus?: PaymentStatus }) =>
      parcelsApi.updateStatus(args.id, {
        status: args.status,
        paymentStatus: args.paymentStatus,
      }),
    (args) => args.id,
  );
}

export function useUpdatePresentLocation() {
  return useParcelMutation(
    (args: { id: string; presentLocation: Location }) =>
      parcelsApi.updatePresentLocation(args.id, args.presentLocation),
    (args) => args.id,
  );
}

export function useAssignCourier() {
  return useParcelMutation(
    (args: { id: string; courierId: string }) =>
      parcelsApi.assignCourier(args.id, args.courierId),
    (args) => args.id,
  );
}

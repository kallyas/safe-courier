import type { Request, Response } from "express";
import { asyncHandler } from "../../shared/asyncHandler";
import { getPagination } from "../../shared/pagination";
import { requireUser } from "../../middlewares/authorize";
import * as parcelService from "./parcel.service";
import type {
  AssignCourierInput,
  CreateParcelInput,
  UpdateDestinationInput,
  UpdatePresentLocationInput,
  UpdateStatusInput,
} from "./parcel.validation";

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const createParcel = asyncHandler(async (req: Request, res: Response) => {
  const { id } = requireUser(req);
  const parcel = await parcelService.createParcel(id, req.body as CreateParcelInput);
  res.status(201).json({
    status: "success",
    message: "Parcel created successfully",
    data: parcel,
  });
});

export const getParcels = asyncHandler(async (req: Request, res: Response) => {
  const requester = requireUser(req);
  const { parcels, meta } = await parcelService.listParcels({
    requester,
    pagination: getPagination(req.query),
    status: asString(req.query.status),
    parcelType: asString(req.query.parcelType),
  });
  res.status(200).json({ status: "success", data: parcels, pagination: meta });
});

export const findParcelById = asyncHandler(
  async (req: Request, res: Response) => {
    const requester = requireUser(req);
    const parcel = await parcelService.getParcelById(req.params.parcelId, requester);
    res.status(200).json({ status: "success", data: parcel });
  },
);

export const getParcelsByUser = asyncHandler(
  async (req: Request, res: Response) => {
    const requester = requireUser(req);
    const { parcels, meta } = await parcelService.getParcelsByUser({
      targetUserId: req.params.userId,
      requester,
      pagination: getPagination(req.query),
      status: asString(req.query.status),
      parcelType: asString(req.query.parcelType),
    });
    res.status(200).json({ status: "success", data: parcels, pagination: meta });
  },
);

export const cancelParcel = asyncHandler(async (req: Request, res: Response) => {
  const requester = requireUser(req);
  const parcel = await parcelService.cancelParcel(req.params.parcelId, requester);
  res.status(200).json({
    status: "success",
    message: "Parcel cancelled successfully",
    data: parcel,
  });
});

export const updateDestination = asyncHandler(
  async (req: Request, res: Response) => {
    const requester = requireUser(req);
    const { locationTo } = req.body as UpdateDestinationInput;
    const parcel = await parcelService.updateDestination(
      req.params.parcelId,
      requester,
      locationTo,
    );
    res.status(200).json({
      status: "success",
      message: "Destination updated successfully",
      data: parcel,
    });
  },
);

export const updateStatus = asyncHandler(async (req: Request, res: Response) => {
  const requester = requireUser(req);
  const { status, paymentStatus } = req.body as UpdateStatusInput;
  const parcel = await parcelService.updateStatus(req.params.parcelId, requester, {
    status,
    paymentStatus,
  });
  res.status(200).json({
    status: "success",
    message: "Status updated successfully",
    data: parcel,
  });
});

export const updateLocation = asyncHandler(
  async (req: Request, res: Response) => {
    const requester = requireUser(req);
    const { presentLocation } = req.body as UpdatePresentLocationInput;
    const parcel = await parcelService.updatePresentLocation(
      req.params.parcelId,
      requester,
      presentLocation,
    );
    res.status(200).json({
      status: "success",
      message: "Location updated successfully",
      data: parcel,
    });
  },
);

export const trackParcel = asyncHandler(async (req: Request, res: Response) => {
  const data = await parcelService.trackParcel(req.params.trackingCode);
  res.status(200).json({ status: "success", data });
});

export const assignCourier = asyncHandler(
  async (req: Request, res: Response) => {
    const { courierId } = req.body as AssignCourierInput;
    const parcel = await parcelService.assignCourier(req.params.parcelId, courierId);
    res.status(200).json({
      status: "success",
      message: "Courier assigned successfully",
      data: parcel,
    });
  },
);

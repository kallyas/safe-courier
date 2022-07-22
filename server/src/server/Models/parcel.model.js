import mongoose from "mongoose"
import { toJson, paginate } from "./plugins/index.js"


const { Schema } = mongoose

const pareclSchema = Schema({
    sender: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      name: {
        type: String,
        required: true,
      },
      address: {
        type: String,
        required: true,
      },
      country: {
        type: String,
        required: true,
      },
      phone_number: {
        type: String,
        required: true,
        maxLength: [10, "Phone number must be 10 digits"],
      },
    },
    parcel_type: {
      type: String,
      required: true,
      enum: ["documents", "clothes", "other"],
    },
    parcel_weight: {
      type: String,
      required: true,
      enum: ["light", "medium", "heavy"],
    },
    parcel_description: {
      type: String,
      required: true,
    },
    drop_off_location: {
      type: String,
      required: true,
    },
    pick_up_location: {
      type: String,
    },
    status: {
      type: String,
      default: "pending",
      enum: ["pending", "in-transit", "delivered"],
    },
    current_location: {
      type: String,
    },
  })

pareclSchema.plugin(toJson)
pareclSchema.plugin(paginate)

const Parcel = mongoose.model("Parcel", pareclSchema)

export default Parcel
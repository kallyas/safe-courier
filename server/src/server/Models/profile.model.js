import mongoose from "mongoose"
import { toJson, paginate } from "./plugins/index.js"

const { Schema } = mongoose

const profileSchema = Schema({
    user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
    address: {
      type: String,
    },
    country: {
      type: String,
    },
    state: {
      type: String,
    },
    zip: {
      type: String,
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other"],
    },
    date_of_birth: {
      type: String,
      required: true,
    },
    phone_number: {
      type: String,
      required: true,
      maxLenght: [10, 'Phone number must be 10 digits'],
    },
    image: {
      type: String,
      required: true,
    },
})

profileSchema.plugin(toJson)
profileSchema.plugin(paginate)


const Profile = mongoose.model("Profile", profileSchema)

export default Profile
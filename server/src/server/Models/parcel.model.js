const mongoose = require("mongoose");
const Schema = mongoose.Schema;

let validateEmail = (email) => {
  var re = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(email);
};

const parcelSchema = new Schema({
  parcelType: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  locationFrom: {
    type: String,
    required: true,
  },
  locationTo: {
    type: String,
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  status: {
    type: String,
    default: "pending",
  },
  price: {
    type: String,
    default: "$100",
  },
  trackingCode: {
    type: String,
  },
  weight: {
    type: Number,
    required: true,
  },
  city: {
    type: String,
    required: true,
  },
  recipient: {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      trim: true,
      unique: false,
      lowercase: true,
      required: "Email address is required",
      validate: [validateEmail, "Please fill a valid email address"],
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please fill a valid email address",
      ],
    },
  },
  presentLocation: {
    type: String
  }
});

parcelSchema.index({ "$**": "text" });

module.exports = mongoose.model("parcel", parcelSchema);

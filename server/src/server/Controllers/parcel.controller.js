const createError = require("http-errors");
const mongoose = require("mongoose");

const Parcel = require("../Models/parcel.model");
const { parcelCheck } = require("../helpers/validation");

module.exports.createParcel = async (req, res, next) => {
  try {
    const { error } = parcelCheck(req.body)
    if(error) return res.status(400).send({ message: error.details[0].message });

    const parcel = new Parcel(req.body);
    const result = await parcel.save();
    res.status(200).send({
      status: "success",
      message: "successfully created",
    });
  } catch (error) {
    console.log(error.message);
    if (error.name === "ValidationError") {
      next(createError(422, error.message));
      return;
    }
    next(error);
  }
};

module.exports.getParcels = async (req, res, next) => {
    try {
      const results = await Parcel.find({}, { __v: 0 }).populate("sender", "-password -email -__v").exec();
      if (!results.length)
        return res.status(200).send({ message: "No Parcels Found!" });
      res.send(results);
    } catch (error) {
      console.log(error.message);
      next(error);
    }
  };
  
// get parcel by ID
module.exports.findParcelById = async (req, res, next) => {
  const id = req.params.parcelId;
  try {
    const parcel = await Parcel.findById(id).select("-__v").populate("sender", "-password -__v")
    // const parcel = await User.findOne({ _id: id });
    if (!parcel) {
      return res.status(404).send({
        status: 404,
        message: "Parcel Does not Exist",
      });
    }
    res.status(200).send(parcel);
  } catch (error) {
    console.log(error.message);
    if (error instanceof mongoose.CastError) {
      res.status(400).json({
        status: 400,
        Message: "Bad Request, Invalid Parcel Id",
      });
      return;
    }
    next(error);
  }
};

module.exports.getParcelsByUser = async (req, res, next) => {
  const id = req.params.userId
  try {
    const parcels = await Parcel.find({ sender: mongoose.Types.ObjectId(id) })
    
    if(!parcels) return res.status(404).send({ status: 404, message: "No parcels found by the user"})
    res.send(parcels)
  } catch (error) {
    console.log(error.message);
    if (error instanceof mongoose.CastError) {
      res.status(400).send({
        status: 400,
        Message: "Bad Request, Invalid User Id",
      });
      return;
    }
    next(error);
  }
}

module.exports.cancelParcel = async (req, res, next) => {
  try {
    const id = req.params.parcelId
    const updates = req.body
    const options = { new: true}

    const result = await Parcel.findByIdAndUpdate(id, updates, options)
    if(!result) return res.status(404).send({status: 404, message: "Parcel order not found"})
    res.send(result)
  } catch (error) {
    console.log(error.message);
    if (error instanceof mongoose.CastError) {
      return next(createError(400, "Invalid User Id"));
    }
    next(error);
  }
}

module.exports.updateDestination = async (req, res, next) => {
  try {
    const id = req.params.parcelId
    const updates = req.body
    const options = { new: true}

    const result = await Parcel.findByIdAndUpdate(id, updates, options)
    if(!result) return res.status(404).send({status: 404, message: "Parcel order not found"})
    res.send(result)
    
  } catch (error) {
    console.log(error.message);
    if (error instanceof mongoose.CastError) {
      return next(createError(400, "Invalid User Id"));
    }
    next(error);
  }
}



module.exports.destroy = (req, res) => {
  Parcel.remove({}, (err) => {
    if(err) console.log(err)
    res.send("success")
  })
}
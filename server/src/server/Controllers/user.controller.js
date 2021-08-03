// logic for user
const createError = require("http-errors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

require("dotenv").config();
const User = require("../Models/user.model");
const { signUpCheck, loginCheck } = require("../helpers/validation");
const auth = require("../helpers/auth");

// create a user
module.exports.createUser = async (req, res, next) => {
	try {
		const { error } = signUpCheck(req.body);
		if (error)
			return res.status(400).send({ message: error.details[0].message });

		const existingUser = await User.findOne({
			username: req.body.username.toLowerCase(),
		});
		if (existingUser)
			return res.status(400).send({ message: "Username already taken! " });

		const existingEmail = await User.findOne({ email: req.body.email });
		if (existingEmail) {
			return res.status(400).send({ message: "Email already exists" });
		}
		const user = new User(req.body);
		const result = await user.save();
		const token = auth.generateAccessToken(result.toJSON());
		res
			.status(201)
			.send({ message: "User created successfully", token: token });
	} catch (error) {
		if (error.name === "ValidationError") {
			next(createError(422, error.message));
			return;
		}
		next(error);
	}
};

module.exports.findUserById = async (req, res, next) => {
	const id = req.params.id;
	try {
		const user = await User.findById(id).select("-password").exec();

		if (!user) {
			res.json({
				status: 404,
				message: "User Does not Exist",
			});
		}
		res.status(200).send(user);
	} catch (error) {
		console.log(error.message);
		if (error instanceof mongoose.CastError) {
			res.json({
				status: 400,
				Message: "Bad Request, Invalid User Id",
			});
			return;
		}
		next(error);
	}
};

module.exports.updateUser = async (req, res, next) => {
	try {
		const id = req.params.id;
		const updates = req.body;
		const options = { new: true };

		const result = await User.findByIdAndUpdate(id, updates, options);
		if (!result) {
			return res.json({
				status: 404,
				Message: "Not Found, User does not exist",
			});
		}
		res.send(result);
	} catch (error) {
		console.log(error.message);
		if (error instanceof mongoose.CastError) {
			return next(createError(400, "Invalid User Id"));
		}

		next(error);
	}
};

module.exports.deleteUser = async (req, res, next) => {
	const id = req.params.id;
	try {
		const result = await User.findByIdAndDelete(id);
		// console.log(result);
		if (!result) {
			res.json({
				status: 404,
				Message: "Not Foud, User does not exist",
			});
		} else {
			res.status(200).send({
				message: "User deleted successfuly!",
			});
		}
	} catch (error) {
		console.log(error.message);
		if (error instanceof mongoose.CastError) {
			next(createError(400, "Invalid User id"));
			return;
		}
		next(error);
	}
};

module.exports.getUsers = async (req, res, next) => {
	try {
		//   https://stackoverflow.com/questions/12096262/how-to-protect-the-password-field-in-mongoose-mongodb-so-it-wont-return-in-a-qu
		const results = await User.find({}, { __v: 0 })
			.select("-password")
			.populate("parcels")
			.exec();
		if (!results.length)
			return res.status(200).send({ message: "No users found!" });
		res.send(results);
	} catch (error) {
		console.log(error.message);
		next(error);
	}
};

module.exports.Login = async (req, res, next) => {
	try {
		//check whether the user exits
		const { error } = loginCheck(req.body);
		if (error) {
			return res.status(400).send({ message: error.details[0].message });
		}
		const user = await User.findOne({ username: req.body.username });
		if (user) {
			//compare passwords using Bcrypt
			const result = await bcrypt.compare(req.body.password, user.password);
			if (result) {
				//const data = req.body;
				const token = auth.generateAccessToken(user.toJSON());
				return res.send({ message: "logged In", token: token });
			} else {
				return res.status(400).send({ message: "Passwords did not match!" });
			}
		} else {
			return res.status(404).send({ message: "User not found!" });
		}
	} catch (error) {
		next(error);
	}
};

process.env.NODE_ENV = "test";

let mongoose = require("mongoose");
let User = require("../Models/user.model");
let Parcel = require("../Models/parcel.model");

const { expect } = require("chai");
const request = require("supertest");
let app = require("../../index");

describe("Parcel", () => {
	beforeEach((done) => {
		User.deleteMany({}, (err) => {});
		Parcel.deleteMany({}, (err) => done(err));
	});

	afterEach((done) => {
		User.deleteMany({}, (err) => done(err));
	});

	let parcel = {
		parcelType: "shipping",
		sender: "60ccaa6a62e8db2144d4f219",
		locationFrom: "Mukono Uganda",
		locationTo: "Jinja Uganda",
		recipient: {
			name: "test",
			email: "test@gmail.com",
		},
		city: "test",
		weight: 4,
	};

	let user = {
		email: "test@gmail.com",
		password: "test",
		firstName: "test",
		lastName: "test",
		username: "test",
	};

	describe("/POST parcel", () => {
		it("should create a parcel (with Authentication)", (done) => {
			request(app)
				.post("/api/v1/auth/signup")
				.send(user)
				.then((res) => {
					const { token } = res.body;
					request(app)
						.post("/api/v1/parcels")
						.set("Authorization", `Bearer ${token}`)
						.send(parcel)
						.then((res) => {
							expect(res.status).to.equal(201);
							expect(res.body).to.contain.property("status");
							expect(res.body).to.contain.property("message");
							expect(res.body).to.contain.property("result");
							expect(res.body.result).to.be.an("object");
							done();
						})
						.catch((err) => done(err));
				})
				.catch((err) => done(err));
		});

		it("should fail to post a parcel without authentication", (done) => {
			request(app)
				.post("/api/v1/parcels")
				.send(parcel)
				.then((res) => {
					expect(res.status).to.equal(401);
					expect(res.text).to.be.equal(
						'{"message":"Unauthorized, Missing Access Token"}'
					);
					done();
				})
				.catch((err) => done(err));
		});

		it("should fail to post a parcel without parcelType", (done) => {
			let parcelWithoutParcelType = {
				sender: "60ccaa6a62e8db2144d4f219",
				locationFrom: "Mukono Uganda",
				locationTo: "Jinja Uganda",
				recipient: {
					name: "test",
					email: "test@mail.com",
				},
				city: "test",
				weight: 4,
			};
			request(app)
				.post("/api/v1/auth/signup")
				.send(user)
				.then((res) => {
					const { token } = res.body;
					request(app)
						.post("/api/v1/parcels")
						.set("Authorization", `Bearer ${token}`)
						.send(parcelWithoutParcelType)
						.then((res) => {
							expect(res.status).to.equal(400);
							expect(res.body.message).to.be.equal('"parcelType" is required');
							done();
						})
						.catch((err) => done(err));
				})
				.catch((err) => done(err));
		});
	});

	describe("/GET parcel", () => {
		it("should get a parcel", (done) => {
			request(app)
				.post("/api/v1/auth/signup")
				.send(user)
				.then((res) => {
					const { token } = res.body;
					request(app)
						.post("/api/v1/parcels")
						.set("Authorization", `Bearer ${token}`)
						.send(parcel)
						.then((res) => {
							request(app)
								.get("/api/v1/parcels")
								.set("Authorization", `Bearer ${token}`)
								.then((res) => {
									expect(res.status).to.equal(200);
									expect(res.body.length).to.equal(1);
									expect(res.body).to.be.an("array");
									done();
								})
								.catch((err) => done(err));
						})
						.catch((err) => done(err));
				})
				.catch((err) => done(err));
		});

		it("should not find a parcel", (done) => {
			request(app)
				.post("/api/v1/auth/signup")
				.send(user)
				.then((res) => {
					const { token } = res.body;
					request(app)
						.get("/api/v1/parcels")
						.set("Authorization", `Bearer ${token}`)
						.then((res) => {
							expect(res.status).to.equal(200);
							expect(res.body).to.be.an("object");
							expect(res.body.message).to.be.equal("No Parcels Found!");
							done();
						})
						.catch((err) => done(err));
				})
				.catch((err) => done(err));
		});
	});
});

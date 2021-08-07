process.env.NODE_ENV = "test";

let mongoose = require("mongoose");
let User = require("../Models/user.model");
let Parcel = require("../Models/parcel.model");

const { expect } = require("chai");
const request = require("supertest");
let app = require("../../index");

describe("User", () => {
	beforeEach((done) => {
		User.deleteMany({}, (err) => {
			done();
		});
	});

	describe("create a user", () => {
		it("should create a user", (done) => {
			request(app)
				.post("/api/v1/auth/signup")
				.send({
					email: "test@gmail.com",
					password: "test",
					firstName: "test",
					lastName: "test",
					username: "test",
				})
				.then((res) => {
					expect(res.status).to.equal(201);
					expect(res.body).to.be.an("object");
					expect(res.body).to.have.property("token");
					expect(res.body).to.have.property("message");
					expect(res.body.message).to.equal("User created successfully");
					done();
				})
				.catch((err) => done(err));
		});

		it("should not create a user without a username", (done) => {
			request(app)
				.post("/api/v1/auth/signup")
				.send({
					email: "test@mail.com",
					password: "test",
					firstName: "test",
					lastName: "test",
				})
				.then((res) => {
					expect(res.status).to.equal(400);
					expect(res.body).to.be.an("object");
					expect(res.body).to.have.property("message");
					expect(res.body.message).to.equal('"username" is required');
					done();
				})
				.catch((err) => done(err));
		});
	});

	describe("login a user", () => {
		it("should login a user", (done) => {
			request(app)
				.post("/api/v1/auth/signup")
				.send({
					email: "test@gmail.com",
					password: "test",
					firstName: "test",
					lastName: "test",
					username: "test",
				})
				.then((res) => {
					request(app)
						.post("/api/v1/auth/login")
						.send({
							username: "test",
							password: "test",
						})
						.then((res) => {
							expect(res.status).to.equal(200);
							expect(res.body).to.be.an("object");
							expect(res.body).to.have.property("token");
							expect(res.body).to.have.property("message");
							expect(res.body.message).to.equal("logged In");
							done();
						})
						.catch((err) => done(err));
				})
				.catch((err) => done(err));
		});

		it("should not login a user with missing fields", (done) => {
			request(app)
				.post("/api/v1/auth/login")
				.send({ password: "test" })
				.then((res) => {
					expect(res.status).to.equal(400);
					expect(res.body).to.be.an("object");
					expect(res.body).to.have.property("message");
					expect(res.body.message).to.equal('"username" is required');
					done();
				})
				.catch((err) => done(err));
		});

		it("should not login user with wrong password", (done) => {
			request(app)
				.post("/api/v1/auth/signup")
				.send({
					email: "test@gmail.com",
					password: "test",
					firstName: "test",
					lastName: "test",
					username: "test",
				})
				.then((res) => {
					request(app)
						.post("/api/v1/auth/login")
						.send({
							username: "test",
							password: "test1234",
						})
						.then((res) => {
							expect(res.status).to.equal(400);
							expect(res.body).to.be.an("object");
							expect(res.body).to.have.property("message");
							expect(res.body.message).to.equal("Passwords did not match!");
							done();
						})
						.catch((err) => done(err));
				})
				.catch((err) => done(err));
		});
	});
});

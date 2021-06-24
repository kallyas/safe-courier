process.env.NODE_ENV = 'test';

let mongoose = require("mongoose");
let User = require('../Models/user.model');
let Parcel = require('../Models/parcel.model')

let chai = require('chai');
let chaiHttp = require('chai-http');
let server = require('../../index');
let should = chai.should();


chai.use(chaiHttp);

describe('Parcels', () => {
    beforeEach((done) => {
        Parcel.remove({}, (err) => {
           done();
        });
    });
  describe('/GET Parcels', () => {
      it('it should GET all the Parcels', (done) => {
            chai.request(server)
            .get('/api/v1/parcels')
            .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('object');
              done();
            });
      });
  });

  describe('/POST Parcel', () => {
      it('it should not POST a parcel order without locationTo field', (done) => {
          let parcel = {
               "parcelType": "courier",
                  "sender": "60ca03558597f630b084d63b",
                  "locationFrom": "Kampala Uganda",
                  "weight": 4,
                  "recipient": {
                    "email": "test@example.com",
                    "name": "test"
                  },
                  "city": "kampala",
          }
            chai.request(server)
            .post('/api/v1/parcels')
            .send(parcel)
            .end((err, res) => {
                  res.should.have.status(400);
                  res.body.should.be.a('object');
                  res.body.should.have.property('message');
                  res.body.message.should.eql('"locationTo" is required');
              done();
            });
      });

      it('it should POST a parcel ', (done) => {
          let parcel = {
            "parcelType": "courier",
            "sender": "60ca03558597f630b084d63b",
            "locationFrom": "Kampala Uganda",
            "weight": 4,
            "recipient": {
              "email": "test@example.com",
              "name": "test"
            },
            "city": "kampala",
          }
            chai.request(server)
            .post('/api/v1/parcels')
            .send(parcel)
            .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.should.have.property('message').eql('successfully created');
              done();
            });
      });
  });
  describe('/GET/:id parcel', () => {
      it('it should GET a parcel by the given id', (done) => {
          let parcel = new Parcel({ _id: 23, parcelType: "Courier", sender: "J.R.R. Tolkien", locationTo: "Kampala", locationFrom: "Jinja", weight: 4 });
          parcel.save((err, parcel) => {
              chai.request(server)
            .get('/api/v1/parcels/' + parcel.parcelId)
            .send(parcel)
            .end((err, res) => {
                  res.should.have.status(200);
                  res.body.should.be.a('object');
                  res.body.should.have.property('parcelType');
                  res.body.should.have.property('sender');
                  res.body.should.have.property('locationFrom');
                  res.body.should.have.property('locationTo');
                  res.body.should.have.property('_id').eql(parcel.id);
              done();
            });
          });

      });
  });
});
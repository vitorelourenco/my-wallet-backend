import { afterAll, beforeEach } from '@jest/globals';
import supertest from 'supertest';
import app from '../src/app.js';
import connection from '../src/database.js';
import {v4 as uuidv4} from 'uuid';
import joi from 'joi';

const logFromDatabaseSchema = joi.object({
  id: joi.number().integer().min(1).required(),
  userId: joi.number().integer().min(1).required(),
  value: joi.number().integer().min(1).required(),
  logKind: joi.string().pattern(/(^earning$)|(^expenditure$)/),
  description: joi.string().min(1).required(),
  createdAt: joi.string().isoDate().required()
});

// expect.extend({
//   toBePositiveInteger(received) {
//     const pass = Number.isInteger(received) && received >=1;
//     if (pass) {
//       return {
//         message: () =>
//           `expected ${received} to be an integer`,
//         pass: true,
//       };
//     } else {
//       return {
//         message: () =>
//           `expected ${received} to be an integer`,
//         pass: false,
//       };
//     }
//   },
//   toBeISODate(received) {
//     const pass = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)$/.test(received);
//     if (pass) {
//       return {
//         message: () =>
//           `expected ${received} to be an ISO date`,
//         pass: true,
//       };
//     } else {
//       return {
//         message: () =>
//           `expected ${received} to be an ISO date`,
//         pass: false,
//       };
//     }
//   },
// });

let id;
let token;

beforeAll( async ()=>{
  //cleanup data from previous tests
  //that used test@dev.com as email
  await connection.query(`
    DELETE FROM users
    WHERE email = 'test@dev.com'
  `);
  await connection.query(`
    DELETE FROM sessions
    WHERE "userId" = $1
  `,[id]);
  await connection.query(`
    DELETE FROM logs
    WHERE "userId" = $1
  `,[id]);
  id = undefined;
  token = undefined;
  //
  //create test account using test@dev.com as email
  await connection.query(`
    INSERT INTO users
    (name, email, password)
    VALUES
    ('autoTester', 'test@dev.com', 'test')
  `);
  //
  //get the id for the newly created test account
  const dbId = await connection.query(`
    SELECT users.id
    FROM users
    WHERE email = 'test@dev.com' 
  `)
  id = dbId.rows[0].id;
  //
  //create a session for the newly created test account
  token = uuidv4();
  await connection.query(`
    INSERT INTO sessions
    ("userId", token)
    VALUES
    ($1, $2)
  `,[id,token]);
});

afterAll( async ()=>{
  connection.end();
});

describe("GET /logs", () => {

  it("returns status 200 for valid header", async () => {
    const headers = {Authorization: `Bearer ${token}`};
    const result = await supertest(app).get("/logs").set(headers);
    expect(result.status).toEqual(200);
  });

  it("returns valid list of logs when all requests are sucessful", async () => {
    const headers = {Authorization: `Bearer ${token}`};
    //post two new logs testing
    const bodyEarning = {value: 1, description: "test earning"}
    await supertest(app).post("/logs/earning/new").send(bodyEarning).set(headers);
    const bodyExpenditure = {value: 1, description: "test expenditure"}
    await supertest(app).post("/logs/expenditure/new").send(bodyExpenditure).set(headers);
    //
    const results = await supertest(app).get("/logs").set(headers);
    const hasFailed = (()=>{
      for (let i=0; i<results.length; i++){
        const {error: responseBodyError} = logFromDatabaseSchema.validate(result);
        if (responseBodyError !== undefined) return true;
      }
      return false;
    })();

    expect(hasFailed).toEqual(false);
  });


  it("returns status 401 for invalid header", async () => {
    const result = await supertest(app).get("/logs");
    expect(result.status).toEqual(401);
  });

});

describe("POST /logs/:logKind=earning/new", () => {

  it("returns status 201 for valid new earning", async () => {
    const headers = {Authorization: `Bearer ${token}`};
    const body = {value: 1, description: "test earning"}
    const result = await supertest(app).post("/logs/earning/new").send(body).set(headers);
    expect(result.status).toEqual(201);
  });

  it("returns valid new log when post new earning succeds", async () => {
    const headers = {Authorization: `Bearer ${token}`};
    const body = {value: 1, description: "test earning"}
    const result = await supertest(app).post("/logs/earning/new").send(body).set(headers);
    const {error: responseBodyError} = logFromDatabaseSchema.validate(result.body);
    expect(responseBodyError).toEqual(undefined);
  });
  
  it("returns status 401 for invalid header", async () => {
    const headers = {Authorization: `Bearer`};
    const body = {value: 1, description: "test earning"}
    const result = await supertest(app).post("/logs/earning/new").send(body).set(headers);
    expect(result.status).toEqual(401);
  });

  it("returns status 400 for invalid value", async () => {
    const headers = {Authorization: `Bearer ${token}`};
    const body = {value: "test string", description: "test earning"}
    const result = await supertest(app).post("/logs/earning/new").send(body).set(headers);
    expect(result.status).toEqual(400);
  });

  it("returns status 400 for invalid description", async () => {
    const headers = {Authorization: `Bearer ${token}`};
    const body = {value: 100, description: {}}
    const result = await supertest(app).post("/logs/earning/new").send(body).set(headers);
    expect(result.status).toEqual(400);
  });

  it("returns status 404 when user is not found", async () => {
    const randomToken = uuidv4();
    const headers = {Authorization: `Bearer ${randomToken}`};
    const body = {value: 100, description: "test earning"}
    const result = await supertest(app).post("/logs/earning/new").send(body).set(headers);
    expect(result.status).toEqual(404);
  });
});

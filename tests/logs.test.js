import { afterAll, beforeEach } from "@jest/globals";
import supertest from "supertest";
import app from "../src/app.js";
import connection from "../src/database.js";
import { v4 as uuidv4 } from "uuid";
import joi from "joi";

const logFromDatabaseSchema = joi.object({
  id: joi.number().integer().min(1).required(),
  userId: joi.number().integer().min(1).required(),
  value: joi.number().integer().min(1).required(),
  logKind: joi.string().pattern(/(^earning$)|(^expenditure$)/),
  description: joi.string().min(1).required(),
  createdAt: joi.string().isoDate().required(),
});

let id;
let token;

beforeAll(async () => {
  //cleanup data from previous tests
  //that used test@logs.com as email
  await connection.query(
    `
    DELETE FROM sessions
    WHERE "userId" 
    IN (
      SELECT id
      FROM users
      WHERE users.email = 'test@logs.com'
    )
  `
  );
  await connection.query(
    `
    DELETE FROM logs
    WHERE "userId" 
    IN (
      SELECT id
      FROM users
      WHERE users.email = 'test@logs.com'
    )
  `
  );

  await connection.query(`
    DELETE FROM users
    WHERE email = 'test@logs.com'
  `);
  
  id = undefined;
  token = undefined;
  //
  //create test account using test@logs.com as email
  await connection.query(`
    INSERT INTO users
    (name, email, password)
    VALUES
    ('autoTester', 'test@logs.com', 'test')
  `);
  //
  //get the id for the newly created test account
  const dbId = await connection.query(`
    SELECT users.id
    FROM users
    WHERE email = 'test@logs.com' 
  `);
  id = dbId.rows[0].id;
  //
  //create a session for the newly created test account
  token = uuidv4();
  await connection.query(
    `
    INSERT INTO sessions
    ("userId", token)
    VALUES
    ($1, $2)
  `,
    [id, token]
  );
});

afterAll(async () => {
  connection.end();
});

describe("GET /logs", () => {
  it("returns status 200 for valid header", async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const result = await supertest(app).get("/logs").set(headers);
    expect(result.status).toEqual(200);
  });

  it("returns valid list of logs when all requests are sucessful", async () => {
    const headers = { Authorization: `Bearer ${token}` };
    //post two new logs for testing
    const bodyEarning = { value: 1, description: "test earning" };
    await supertest(app)
      .post("/logs/earning/new")
      .send(bodyEarning)
      .set(headers);
    const bodyExpenditure = { value: 1, description: "test expenditure" };
    await supertest(app)
      .post("/logs/expenditure/new")
      .send(bodyExpenditure)
      .set(headers);
    //
    const results = await supertest(app).get("/logs").set(headers);
    const responseBodyError = (() => {
      for (let i = 0; i < results.length; i++) {
        const { error: responseBodyError } =
          logFromDatabaseSchema.validate(result);
        if (responseBodyError !== undefined) return responseBodyError;
      }
      return undefined;
    })();

    expect(responseBodyError).toEqual(undefined);
  });

  it("returns status 401 for invalid header", async () => {
    const result = await supertest(app).get("/logs");
    expect(result.status).toEqual(401);
  });

  it("returns status 404 when user is not found", async () => {
    const randomToken = uuidv4();
    const headers = { Authorization: `Bearer ${randomToken}` };
    const result = await supertest(app).get("/logs").set(headers);
    expect(result.status).toEqual(404);
  });
});

describe("POST /logs/:logKind=earning/new", () => {
  it("returns status 201 for valid new earning", async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const body = { value: 1, description: "test earning" };
    const result = await supertest(app)
      .post("/logs/earning/new")
      .send(body)
      .set(headers);
    expect(result.status).toEqual(201);
  });

  it("returns valid new log when post new earning succeds", async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const body = { value: 1, description: "test earning" };
    const result = await supertest(app)
      .post("/logs/earning/new")
      .send(body)
      .set(headers);
    const { error: responseBodyError } = logFromDatabaseSchema.validate(
      result.body
    );
    expect(responseBodyError).toEqual(undefined);
  });

  it("returns status 401 for invalid header", async () => {
    const headers = { Authorization: `Bearer` };
    const body = { value: 1, description: "test earning" };
    const result = await supertest(app)
      .post("/logs/earning/new")
      .send(body)
      .set(headers);
    expect(result.status).toEqual(401);
  });

  it("returns status 400 for invalid new earning value", async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const body = { value: -1, description: "test earning" };
    const result = await supertest(app)
      .post("/logs/earning/new")
      .send(body)
      .set(headers);
    expect(result.status).toEqual(400);
  });

  it("returns status 400 for invalid new earning description", async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const body = { value: 100, description: "" };
    const result = await supertest(app)
      .post("/logs/earning/new")
      .send(body)
      .set(headers);
    expect(result.status).toEqual(400);
  });

  it("returns status 404 when user is not found", async () => {
    const randomToken = uuidv4();
    const headers = { Authorization: `Bearer ${randomToken}` };
    const body = { value: 100, description: "test earning" };
    const result = await supertest(app)
      .post("/logs/earning/new")
      .send(body)
      .set(headers);
    expect(result.status).toEqual(404);
  });
});

describe("POST /logs/:logKind=expenditure/new", () => {
  it("returns status 201 for valid new expenditure", async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const body = { value: 1, description: "test expenditure" };
    const result = await supertest(app)
      .post("/logs/expenditure/new")
      .send(body)
      .set(headers);
    expect(result.status).toEqual(201);
  });

  it("returns valid new log when post new expenditure succeds", async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const body = { value: 1, description: "test expenditure" };
    const result = await supertest(app)
      .post("/logs/expenditure/new")
      .send(body)
      .set(headers);
    const { error: responseBodyError } = logFromDatabaseSchema.validate(
      result.body
    );
    expect(responseBodyError).toEqual(undefined);
  });

  it("returns status 401 for invalid header", async () => {
    const headers = { Authorization: `Bearer` };
    const body = { value: 1, description: "test expenditure" };
    const result = await supertest(app)
      .post("/logs/expenditure/new")
      .send(body)
      .set(headers);
    expect(result.status).toEqual(401);
  });

  it("returns status 400 for invalid new expenditure value", async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const body = { value: -1, description: "test expenditure" };
    const result = await supertest(app)
      .post("/logs/expenditure/new")
      .send(body)
      .set(headers);
    expect(result.status).toEqual(400);
  });

  it("returns status 400 for invalid new expenditure description", async () => {
    const headers = { Authorization: `Bearer ${token}` };
    const body = { value: 100, description: "" };
    const result = await supertest(app)
      .post("/logs/expenditure/new")
      .send(body)
      .set(headers);
    expect(result.status).toEqual(400);
  });

  it("returns status 404 when user is not found", async () => {
    const randomToken = uuidv4();
    const headers = { Authorization: `Bearer ${randomToken}` };
    const body = { value: 100, description: "test expenditure" };
    const result = await supertest(app)
      .post("/logs/expenditure/new")
      .send(body)
      .set(headers);
    expect(result.status).toEqual(404);
  });
});

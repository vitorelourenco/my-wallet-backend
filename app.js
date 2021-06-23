import cors from "cors";
import express from "express";
import { postNewLog } from "./logs.js";
import addUser from "./signUp.js";
import { getStatement } from "./statement.js";
import login from './login.js';

const app = express();
app.use(express.json());
app.use(cors());

app.get("/expenditures", (req, res) => getExpenditures(req, res));
app.post("/expenditures", (req, res) => addExpenditure(req, res));

app.get("/earnings", (req, res) => getEarnings(req, res));
app.post("/earnings", (req, res) => addEarning(req, res));

app.get("/statement", (req, res) => getStatement(req, res));

app.post("/new/:logKind", (req, res) => postNewLog(req, res));

app.post("/signup", (req, res) => addUser(req, res));

app.post("/login", (req, res) => login(req, res));


const port = 4000;
app.listen(port, () =>
  console.log(`my-wallet server is listening on port ${port}`)
);

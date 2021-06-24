import cors from "cors";
import express from "express";
import { postNewLog, getLogs } from "./logs.js";
import addUser from "./signup.js";
import login from "./login.js";
import logout from "./logout.js";
import { confirmSession } from "./sessions.js";

const app = express();
app.use(express.json());
app.use(cors());

app.get("/sessions/withtoken", (req, res) => confirmSession(req, res));

app.get("/logs", (req, res) => getLogs(req, res));
app.post("/logs/:logKind/new", (req, res) => postNewLog(req, res));

app.post("/signup", (req, res) => addUser(req, res));

app.post("/login", (req, res) => login(req, res));

app.post("/logout", (req, res) => logout(req, res));

const port = 4000;
app.listen(port, () =>
  console.log(`my-wallet server is listening on port ${port}`)
);

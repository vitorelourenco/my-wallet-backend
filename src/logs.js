import connection from "./database.js";
import { authorizationSchema, newLogSchema, logKindSchema } from "./schemas.js";
import errorWithStatus from "./errorWithStatus.js";

async function getLogs(req, res) {
  try {
    const { value: authorization, error: authorizationError } =
      authorizationSchema.validate(req.headers.authorization);
    if (authorizationError) throw new errorWithStatus(401);

    const token = authorization.replace("Bearer ", "");

    const dbStatement = await connection.query(
      `
    SELECT logs.*
    FROM logs
    JOIN sessions 
    ON sessions.token = $1
    WHERE sessions."userId" = logs."userId"
    ORDER BY "createdAt" DESC
  ;`,
      [token]
    );

    res.send(dbStatement.rows);
  } catch (err) {
    if (err.status) res.sendStatus(err.status);
    else res.sendStatus(500);
    console.log(err);
  }
}

async function postNewLog(req, res) {
  try {
    const { value: authorization, error: authorizationError } =
      authorizationSchema.validate(req.headers.authorization);
    if (authorizationError) throw new errorWithStatus(401);

    const { value: newLog, error: newLogError } = newLogSchema.validate(
      req.body
    );
    const { value: logKind, error: logKindError } = logKindSchema.validate(
      req.params.logKind
    );
    const validationError = newLogError || logKindError;
    if (validationError) throw new errorWithStatus(400);

    const token = authorization.replace("Bearer ", "");
    const dbUser = await connection.query(
      `
      SELECT sessions."userId"
      FROM sessions 
      JOIN users 
      ON sessions."userId" = users.id
      WHERE token = $1
    ;`,
      [token]
    );

    const user = dbUser.rows[0];
    if (typeof user !== "object" || !user.userId) throw new errorWithStatus(404);

    const dbNewEntry = await connection.query(
      `
      INSERT INTO logs
      ("userId", value, "logKind", description, "createdAt")
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    ;`,
      [user.userId, newLog.value, logKind, newLog.description]
    );

    res.status(201).send(dbNewEntry.rows[0]);
  } catch (err) {
    if (err.status) res.sendStatus(err.status);
    else res.sendStatus(500);
    console.log(err);
  }
}

export { postNewLog, getLogs };

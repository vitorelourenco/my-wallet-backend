import connection from "./database.js";
import {authorizationSchema, newLogSchema, logKindSchema} from './schemas.js';
import acceptanceError from './acceptanceError.js';

async function getLogs(req,res){
  try{
  const {value: authorization, error: authorizationError} = authorizationSchema.validate(req.headers.authorization);
  if (authorizationError) throw new acceptanceError(400);
  const token = authorization.replace('Bearer ',"");

  const dbStatement = await connection.query(`
    SELECT logs.*
    FROM logs
    JOIN sessions 
    ON sessions.token = $1
    ORDER BY "createdAt" DESC
  ;`,[token]);

  res.send(dbStatement.rows);
  } catch(e) {
    if (e.status) res.sendStatus(e.status);
    else res.sendStatus(500);
    console.log(e);
  }
}

async function postNewLog(req, res){
  try {
    const {value: newLog, error: newLogError} = newLogSchema.validate(req.body);
    const {value: logKind, error: logKindError} = logKindSchema.validate(req.params.logKind);
    const {value: authorization, error: tokenError} = authorizationSchema.validate(req.headers.authorization);
    const validationError = newLogError || logKindError || tokenError;
    if (validationError) throw new acceptanceError(400);

    const token = authorization.replace('Bearer ','');

    const dbUser = await connection.query(`
      SELECT sessions."userId"
      FROM sessions 
      JOIN users 
      ON sessions."userId" = users.id
      WHERE token = $1
    ;`,[token]);
 
    const user = dbUser.rows[0];    
    if (!user.userId) throw new acceptanceError(404);

    const dbNewEntry = await connection.query(`
      INSERT INTO logs
      ("userId", value, "logKind", description, "createdAt")
      VALUES ($1, $2, $3, $4, NOW())
      RETURNING *
    ;`, [user.userId, newLog.value, logKind, newLog.description])

    res.status(201).send(dbNewEntry.rows[0]);
  } catch(e) {
    if(e.status) res.sendStatus(e.status)
    else res.sendStatus(500);
    console.log(e);
  }
}

export {
  postNewLog,
  getLogs
}
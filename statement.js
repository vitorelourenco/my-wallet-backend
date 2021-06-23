import connection from "./database.js";
import { authorizationSchema } from "./schemas.js";
import acceptanceError from './acceptanceError.js';

async function getStatement(req,res){
  try{
  const {value: authorization, error: authorizationError} = authorizationSchema.validate(req.headers.authorization);
  if (authorizationError) throw new acceptanceError(400);
  const token = authorization.replace('Bearer ',"");

  const dbStatement = await connection.query(`
    SELECT logs.*
    FROM logs
    JOIN sessions 
    ON sessions.token = $1
    ORDER BY "createdAt"
  ;`,[token]);

  res.send(dbStatement.rows);
  } catch(e) {
    if (e.status) res.sendStatus(e.status);
    else res.sendStatus(500);
    console.log(e);
  }
}

export {
  getStatement
}
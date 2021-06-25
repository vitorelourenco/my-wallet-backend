import errorWithStatus from "./errorWithStatus.js";
import { authorizationSchema } from "./schemas.js";
import connection from "./database.js";

export async function confirmSession(req, res) {
  try {
    const { value: authorization, error: authorizationError } =
      authorizationSchema.validate(req.headers.authorization);
    if (authorizationError) throw new errorWithStatus(401);

    const token = authorization.replace("Bearer ", "");

    const dbSession = await connection.query(
      `
      SELECT *
      FROM sessions
      WHERE token = $1
    ;`,
      [token]
    );

    if (dbSession.rows.length !== 1) throw new errorWithStatus(404);

    res.sendStatus(200);
  } catch (err) {
    if (err.status) res.sendStatus(err.status);
    else res.sendStatus(500);
    console.log(err);
  }
}

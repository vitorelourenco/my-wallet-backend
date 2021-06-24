import errorWithStatus from "./errorWithStatus.js";
import connection from "./database.js";
import { authorizationSchema } from "./schemas.js";

export default async function logout(req, res) {
  try {
    const { value: authorization, error: authorizationError } =
      authorizationSchema.validate(req.headers["authorization"]);
    if (authorizationError) throw new errorWithStatus(400);
    const token = authorization.replace("Bearer ", "");
    await connection.query(
      `
      DELETE FROM sessions
      WHERE token = $1
    ;`,
      [token]
    );
    res.sendStatus(200);
  } catch (err) {
    if (err.status) res.sendStatus(err.status);
    else res.sendStatus(500);
    console.log(err);
  }
}

import bcrypt from "bcrypt";

import { newUserSchema } from "./schemas.js";
import connection from "./database.js";
import errorWithStatus from "./errorWithStatus.js";

export default async function addUser(req, res) {
  try {
    const { value: newUser, error: newUserError } = newUserSchema.validate(
      req.body
    );
    if (newUserError) throw new errorWithStatus(400);

    const dbSameEmail = await connection.query(
      `
      SELECT * 
      FROM USERS 
      WHERE email = $1
    ;`,
      [newUser.email]
    );

    if (dbSameEmail.rows.length > 0) throw new errorWithStatus(409);

    await connection.query(
      `
      INSERT INTO users
      (name, email, password)
      VALUES ($1, $2, $3)
    ;`,
      [newUser.name, newUser.email, bcrypt.hashSync(newUser.password, 10)]
    );

    res.sendStatus(201);
  } catch (err) {
    if (err.status) res.sendStatus(err.status);
    else res.sendStatus(500);
    console.log(err);
  }
}

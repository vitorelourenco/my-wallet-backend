import {newUserSchema} from './schemas.js';
import connection from './database.js';
import {v4 as uuidv4} from 'uuid';
import bcrypt from 'bcrypt';
import acceptanceError from './acceptanceError.js';

export default async function addUser(req,res){
  try {
    const {value: newUser, error: newUserError} = newUserSchema.validate(req.body);
    if (newUserError) throw new acceptanceError(400);

    const dbSameEmail = await connection.query(`
      SELECT * 
      FROM USERS 
      WHERE email = $1
    ;`, [newUser.email]);

    if(dbSameEmail.rows.length > 0) throw new acceptanceError(409);

    await connection.query(`
      INSERT INTO users
      (name, email, password)
      VALUES ($1, $2, $3)
    ;`,[
      newUser.name,
      newUser.email,
      bcrypt.hashSync(newUser.password, 10)
    ]);

    res.sendStatus(201);
  } catch (e) {
    if (e.status) res.sendStatus(e.status);
    else res.sendStatus(500);
    console.log(e);
  }
}
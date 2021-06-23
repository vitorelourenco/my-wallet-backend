import {loginSchema} from './schemas.js';
import connection from './database.js';
import {v4 as uuidv4} from 'uuid';
import bcrypt from 'bcrypt';
import acceptanceError from './acceptanceError.js';

export default async function login(req,res){
  try {
    const {value: user, error: userError} = loginSchema.validate(req.body);
    if (userError) 
      throw new acceptanceError(400);

    const dbSameEmail = await connection.query(`
      SELECT * 
      FROM USERS 
      WHERE email = $1
    ;`, [user.email]);

    if(dbSameEmail.rows.length !== 1) 
      throw new acceptanceError(404);


    const userFound = dbSameEmail.rows[0];
    if (!bcrypt.compareSync(user.password, userFound.password))
      throw new acceptanceError(401);

    const token = uuidv4();
    const id = userFound.id;

    await connection.query(`
      INSERT INTO sessions
      ("userId", token)
      VALUES ($1, $2)
    ;`,[id, token]);

    const {name, email} = userFound;
    res.send({id, token, name, email});
  } catch (e) {
    if (e.status) res.sendStatus(e.status);
    else res.sendStatus(500);
    console.log(e);
  }
}
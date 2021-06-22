import connection from "./database.js";
import {earningOrExpenditureSchema, authSchema} from './schemas.js';


async function getEarningsOrExpenditures(req,res, table){
  const fetchQuery = `
    SELECT * 
    FROM ${table}
  `;

  try {
    const result = await connection.query(fetchQuery);
    res.send(result.rows);
  } catch (e) {
    console.log(e);
    res.sendStatus(500);
  }
}

async function addEarningOrExpenditure(req, res, table){
  const {value: bodyValue, error: bodyError} = earningOrExpenditureSchema.validate(req.body);
  if (bodyError){
    console.log(bodyError);
    res.sendStatus(400);
    return;
  }

  const postQuery = `
    INSERT INTO ${table}
    ("idUser", value, "createdAt", description)
    VALUES
    ($1, $2, NOW(), $3)
  `;

  const {idUser, value, description} = bodyValue;
  const insertParams = [idUser, value, description]

  try {
    await connection.query(postQuery, insertParams);
    res.sendStatus(201);
  } catch(e) {
    console.log(e);
    res.sendStatus(500);
  }
}

const getEarnings = (req,res) => getEarningsOrExpenditures(req,res, "earnings");
const addEarning = (req,res) => addEarningOrExpenditure(req,res, "earnings")

const getExpenditures = (req,res) => getEarningsOrExpenditures(req,res, "expenditures");
const addExpenditure = (req,res) => addEarningOrExpenditure(req,res, "expenditures");

export {
  getEarnings,
  addEarning,
  getExpenditures,
  addExpenditure
}
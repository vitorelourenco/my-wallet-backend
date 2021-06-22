import connection from "./database.js";

async function getStatement(req,res){
  const fetchQuery = `
    SELECT 
      "idUser", 
      value, 
      "createdAt", 
      description , 
      'expenditure' AS "transactionType"
    FROM expenditures

    UNION 

    SELECT 
      "idUser", 
      value, 
      "createdAt", 
      description , 
      'earning' AS "transactionType"
    FROM earnings

    ORDER BY "createdAt"
  ;`;

  const dbStatement = await connection.query(fetchQuery);
  res.send(dbStatement.rows)
}

export {
  getStatement
}
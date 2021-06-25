import app from "./app.js";

app.listen(process.env.PORT, () =>
  console.log(`my-wallet server is listening on port ${process.env.PORT}`)
);

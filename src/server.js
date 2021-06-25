import app from "./app.js";

const port = 4000;
app.listen(port, () =>
  console.log(`my-wallet server is listening on port ${port}`)
);

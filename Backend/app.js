const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

require("dotenv/config");

const api = process.env.API_URL;
const productRouter = require("./routers/product");

//middleware
app.use(express.json());
app.use(morgan("tiny"));

//Routers
app.use(`${api}/products`, productRouter);

mongoose
  .connect(process.env.CONNECTION_STRING, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    dbName: "pandasdb",
  })
  .then(() => {
    console.log("La base de données est prête !!!");
  })
  .catch((err) => {
    console.log(err);
  });

app.listen(3000, () => {
  console.log("En ecoute sur le port 3000");
});

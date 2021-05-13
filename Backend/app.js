// all import
const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const cors = require("cors");
const methodOverride = require("method-override");

app.use(cors());
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.options("*", cors);

require("dotenv/config");
const authJwt = require("./helpers/jwt");

//middleware
app.use(express.json());
app.use(morgan("tiny"));
app.use(authJwt());
app.use(methodOverride());
app.use(function (err, req, res, next) {
  if (err.name == "UnauthorizedError") {
    //jwt authentication error
    return res
      .status(500)
      .json({ message: "L'utilisatteur n'est pas autorisé... ! " });
  }
  if (err.name == "ValidationError") {
    //validator error
    return res.status(500).json({ message: err });
  }
  // default  to 500 server error
  return res.status(500).json(err);
});

//Routes
const categoriesRoutes = require("./routes/categories");
const productsRoutes = require("./routes/products");
const userRoustes = require("./routes/users");
const ordersRoutes = require("./routes/orders");

const api = process.env.API_URL;

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, userRoustes);
app.use(`${api}/orders`, ordersRoutes);

//Database
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
//Server
app.listen(3000, () => {
  console.log("En ecoute sur le port 3000");
});

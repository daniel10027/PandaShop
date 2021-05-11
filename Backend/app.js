const express = require("express");
const app = express();
const morgan = require("morgan");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

require("dotenv/config");

const api = process.env.API_URL;

app.use(express.json());
app.use(morgan("tiny"));

const productSchema = mongoose.Schema({
  name: String,
  image: String,
  countInStock: {
    type: Number,
    required: true,
  },
});

const Product = mongoose.model("Product", productSchema);

app.get(`${api}/products`, async (req, res) => {
  const productList = await Product.find();
  if (!productList) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(productList);
});

app.post(`${api}/products`, (req, res) => {
  const product = new Product({
    name: req.body.name,
    image: req.body.image,
    countInStock: req.body.countInStock,
  });
  product
    .save()
    .then((createdProduct) => {
      res.status(201).json(createdProduct);
    })
    .catch((err) => {
      res.status(500).json({
        error: err,
        success: false,
      });
    });
});

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

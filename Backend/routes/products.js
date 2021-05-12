const { Product } = require("../models/product");
const express = require("express");
const { Category } = require("../models/category");
const router = express.Router();

// Get all products

router.get(`/`, async (req, res) => {
  const productList = await Product.find().populate("category");
  if (!productList) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(productList);
});

//add New product
router.post(`/`, async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category)
    return res
      .status(400)
      .send("L'id de la catégorie ne correpond à aucune catégorie ! ");
  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: req.body.image,
    // images: req.body.images,
    brand: req.body.brand,
    price: req.body.price,
    category: req.body.category,
    countInStock: req.body.countInStock,
    rating: req.body.rating,
    numReviews: req.body.numReviews,
    isFeatured: req.body.isFeatured,
  });

  product = await product.save();
  if (!product)
    return res.status(500).send("Le produit ne peut pas être crée !! ");
  res.send(product);
});

module.exports = router;

//Get Single Product

router.get(`/:id`, async (req, res) => {
  const product = await Product.findById(req.params.id).populate("category");
  if (!product) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(product);
});

//update a product

router.put(`/:id`, async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category)
    return res
      .status(400)
      .send("L'id de la catégorie ne correpond à aucune catégorie ! ");

  const product = await Product.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      description: req.body.description,
      richDescription: req.body.richDescription,
      image: req.body.image,
      // images: req.body.images,
      brand: req.body.brand,
      price: req.body.price,
      category: req.body.category,
      countInStock: req.body.countInStock,
      rating: req.body.rating,
      numReviews: req.body.numReviews,
      isFeatured: req.body.isFeatured,
    },
    { new: true }
  );

  if (!product)
    return res.status(500).send("Le produit n'a pas pu être mise à jour !");
  res.send(product);
});

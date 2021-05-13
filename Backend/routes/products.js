const { Product } = require("../models/product");
const express = require("express");
const { Category } = require("../models/category");
const router = express.Router();
const mongoose = require("mongoose");

const multer = require("multer");

const FILE_TYPE_MAP = {
  "image/png": "png",
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
};

//multer file storage

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const isValid = FILE_TYPE_MAP[file.mimetype];
    let uploadError = new Error("Image invalid !!!");
    if (isValid) {
      uploadError = null;
    }
    cb(uploadError, (__dirname, "public/uploads/"));
  },
  filename: function (req, file, cb) {
    const fileName = file.originalname.split(" ").join("-");
    const extension = FILE_TYPE_MAP[file.mimetype];
    cb(null, `${fileName}-${Date.now()}.${extension}`);
  },
});

const uploadOptions = multer({ storage: storage });

//Create Product
router.post(`/`, uploadOptions.single("image"), async (req, res) => {
  const category = await Category.findById(req.body.category);
  if (!category)
    return res
      .status(400)
      .send("L'id de la catégorie ne correpond à aucune catégorie ! ");
  const file = req.file;
  if (!file) return res.status(400).send("Aucune image pour le produit !!! ");
  const fileName = req.file.filename;
  const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
  let product = new Product({
    name: req.body.name,
    description: req.body.description,
    richDescription: req.body.richDescription,
    image: `${basePath}${fileName}`,
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

// Get all products

router.get(`/`, async (req, res) => {
  let filter = {};
  if (req.query.categories) {
    filter = { category: req.query.categories.split(",") };
  }
  const productList = await Product.find(filter).populate("category");

  if (!productList) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(productList);
});

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

router.put(`/:id`, uploadOptions.single("image"), async (req, res) => {
  if (!mongoose.isValidObjectId(req.params.id)) {
    res.status(400).send("L'Id du produit est Invalide ... !");
  }
  const category = await Category.findById(req.body.category);
  if (!category)
    return res
      .status(400)
      .send("L'id de la catégorie ne correpond à aucune catégorie ! ");

  const product = await Product.findById(req.params.id);
  if (!product) return res.status(400).send("Produit invalide");

  const file = req.file;
  let imagepath;

  if (file) {
    const fileName = req.file.filename;
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    imagepath = `${basePath}${fileName}`;
  } else {
    imagepath = product.image;
  }

  const updatedProduct = await Product.findByIdAndUpdate(
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

  if (!updatedProduct)
    return res.status(500).send("Le produit n'a pas pu être mise à jour !");
  res.send(updatedProduct);
});

//Delete Product

router.delete(`/:id`, async (req, res) => {
  Product.findByIdAndRemove(req.params.id)
    .then((product) => {
      if (product) {
        return res
          .status(200)
          .json({ success: true, message: "Le produit a été supprimée " });
      } else {
        return res.status(400).json({
          success: false,
          message: "Le produit n'a pas pu a être supprimée",
        });
      }
    })
    .catch((err) => {
      return res.status(200).json({
        success: false,
        err: err,
      });
    });
});

// Get product Count for statistics

router.get(`/get/count`, async (req, res) => {
  const productCount = await Product.countDocuments((count) => count);
  if (!productCount) {
    res.status(500).json({
      success: false,
    });
  }
  res.send({
    productCount: productCount,
  });
});

// Get FeaturedProduct Count for statistics

router.get(`/get/featured/:count`, async (req, res) => {
  const count = req.params.count ? req.params.count : 0;
  const products = await Product.find({ isFeatured: true }).limit(+count);
  if (!products) {
    res.status(500).json({
      success: false,
    });
  }
  res.send({
    products,
  });
});

// Upload image Gallery in single row

router.put(
  `/gallery-images/:id`,
  uploadOptions.array("images", 10),
  async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(400).send("L'Id du produit est Invalide ... !");
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get("host")}/public/uploads/`;
    if (files) {
      files.map(file => {
        imagesPaths.push(`${basePath}${file.filename}`);
      });
    } 

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        images: imagesPaths,
      },
      { new: true }
    );

    if (!product)
      return res.status(500).send("Le produit n'a pas pu être mise à jour !");
    res.send(product );
  }
);
module.exports = router;

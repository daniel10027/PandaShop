const { Category } = require("../models/category");
const express = require("express");
const router = express.Router();

//get all category

router.get(`/`, async (req, res) => {
  const categoryList = await Category.find();
  if (!categoryList) {
    res.status(500).json({
      success: false,
    });
  }
  res.status(200).send(categoryList);
});

// get single category

router.get(`/:id`, async (req, res) => {
  const category = await Category.findByIdAndRemove(req.params.id);
  if (!category) {
    res.status(500).json({
      message: "Auncune catégorie ne correspond a ce ID",
    });
  }
  res.status(200).send(category);
});

//add a category

router.post(`/`, async (req, res) => {
  let category = new Category({
    name: req.body.name,
    icon: req.body.icon,
    color: req.body.color,
  });

  category = await category.save();
  if (!category)
    return res.status(404).send("La catégorie n'a pas pu être crée !");
  res.send(category);
});

//update a category

router.put(`/:id`, async (req, res) => {
  const category = await Category.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      icon: req.body.icon || category.icon,
      color: req.body.color,
    },
    { new: true }
  );

  if (!category)
    return res.status(404).send("La catégorie n'a pas pu être mise à jour !");
  res.send(category);
});

//delete a category

router.delete(`/:id`, async (req, res) => {
  Category.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category) {
        return res
          .status(200)
          .json({ success: true, message: "La catégorie a été supprimée " });
      } else {
        return res.status(200).json({
          success: false,
          message: "La catégorie n'a pas pu a être supprimée",
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

module.exports = router;

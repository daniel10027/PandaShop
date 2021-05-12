const { User } = require("../models/user");
const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//get all User
router.get(`/`, async (req, res) => {
  const userList = await User.find().select("-passwordHash");
  if (!userList) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(userList);
});

//get Single User

router.get(`/:id`, async (req, res) => {
  const user = await User.findById(req.params.id).select("-passwordHash");
  if (!user) {
    res.status(500).json({
      success: false,
      message: "Aucun utilisateur trouvé !",
    });
  }
  res.send(user);
});

//add User

router.post(`/`, async (req, res) => {
  let user = new User({
    name: req.body.name,
    email: req.body.email,
    passwordHash: bcrypt.hashSync(req.body.passwordHash, 10),
    phone: req.body.phone,
    isAdmin: req.body.isAdmin,
    apartment: req.body.apartment,
    zip: req.body.zip,
    country: req.body.country,
    street: req.body.street,
  });

  user = await user.save();
  if (!user)
    return res.status(404).send("L'utilisateur  n'a pas pu être crée !");
  res.send(user);
});

//User Login

router.post("/login", async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  const secret = process.env.secret;
  if (!user) {
    return res.status(400).send("L'utilisateur n'a pas été trouvé ...!");
  }
  if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
    const token = jwt.sign(
      {
        userId: user.id,
        isAdmin: user.isAdmin
      },
      secret,
      { expiresIn: "1d" } // duration of token expiration
    );
    res.status(200).send({ user: user.email, token: token });
  } else {
    res.status(400).send("Le mot de passe est incorrect  .....");
  }
});

// Get Users Count for statistics

router.get(`/get/count`, async (req, res) => {
  const userCount = await User.countDocuments((count) => count);
  if (!userCount) {
    res.status(500).json({
      success: false,
    });
  }
  res.send({
    userCount: userCount,
  });
});


//delete User

router.delete(`/:id`, async (req, res) => {
  Category.findByIdAndRemove(req.params.id)
    .then((category) => {
      if (category) {
        return res
          .status(200)
          .json({ success: true, message: "La catégorie a été supprimée " });
      } else {
        return res.status(400).json({
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

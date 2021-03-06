const { Order } = require("../models/order");
const express = require("express");
const { OrderItem } = require("../models/order-item");
const router = express.Router();


//All Order List
router.get(`/`, async (req, res) => {
  const orderList = await Order.find()
    .populate("user", "name")
    .sort({ dateOrdered: -1 });
  if (!orderList) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(orderList);
});

//Single Order Detail
router.get(`/:id`, async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate("user", "name")
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    });
  if (!order) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(order);
});

//Add new Order

router.post(`/`, async (req, res) => {
  const orderItemsIds = Promise.all(
    req.body.orderItems.map(async (orderItem) => {
      let newOrderItem = new OrderItem({
        quantity: orderItem.quantity,
        product: orderItem.product,
      });
      newOrderItem = await newOrderItem.save();
      return newOrderItem._id;
    })
  );

  const orderItemsIdsResolved = await orderItemsIds;

  const totalPrices = await Promise.all(
    orderItemsIdsResolved.map(async (orderItemId) => {
      const orderItem = await OrderItem.findById(orderItemId).populate(
        "product",
        "price "
      );
      const totalPrice = orderItem.product.price * orderItem.quantity;
      return totalPrice;
    })
  );
  console.log(totalPrices);
  const totalPrice = totalPrices.reduce((a, b) => a + b, 0);

  let order = new Order({
    orderItems: orderItemsIdsResolved,
    shippingAddress1: req.body.shippingAddress1,
    shippingAddress2: req.body.shippingAddress2,
    city: req.body.city,
    zip: req.body.zip,
    country: req.body.country,
    phone: req.body.phone,
    status: req.body.status,
    totalPrice: totalPrice,
    user: req.body.user,
  });

  order = await order.save();
  if (!order) return res.status(404).send("La commande n'a pas pu ??tre cr??e !");
  res.send(order);
});

//update Orders

router.put(`/:id`, async (req, res) => {
  const order = await Order.findByIdAndUpdate(
    req.params.id,
    {
      status: req.body.status,
    },
    { new: true }
  );

  if (!order)
    return res.status(404).send("La cat??gorie n'a pas pu ??tre mise ?? jour !");
  res.send(order);
});

//delete Order

router.delete(`/:id`, async (req, res) => {
  Order.findByIdAndRemove(req.params.id)
    .then(async (order) => {
      if (order) {
        await order.orderItems.map(async (orderItem) => {
          await OrderItem.findByIdAndRemove(orderItem);
        });
        return res
          .status(200)
          .json({ success: true, message: "La commande a ??t?? supprim??e " });
      } else {
        return res.status(400).json({
          success: false,
          message: "La commande n'a pas pu a ??tre supprim??e",
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

// Get total Sale in admin PANEL
router.get("/get/totalsales", async (req, res) => {
  const totalSales = await Order.aggregate([
    {
      $group: {
        _id: null,
        totalsales: {
          $sum: "$totalPrice",
        },
      },
    },
  ]);
  if (!totalSales) {
    return res.status(400).send("Le nombre de vente ne peut ??tre g??n??r??");
  }
  res.send({ totalsales: totalSales.pop().totalsales });
});

// Get ORDER Count for statistics

router.get(`/get/count`, async (req, res) => {
  const orderCount = await Order.countDocuments((count) => count);
  if (!orderCount) {
    res.status(500).json({
      success: false,
    });
  }
  res.send({
    orderCount: orderCount,
  });
});

//Get current user Order
router.get(`/get/userorders/:userid`, async (req, res) => {
  const userOrderList = await Order.find({ user: req.params.userid })
    .populate({
      path: "orderItems",
      populate: { path: "product", populate: "category" },
    })
    .sort({ dateOrdered: -1 });
  if (!userOrderList) {
    res.status(500).json({
      success: false,
    });
  }
  res.send(userOrderList);
});

module.exports = router;

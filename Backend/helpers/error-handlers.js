function errorHandler(err, req, res, next) {
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
}

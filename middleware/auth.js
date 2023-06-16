const jwt = require("jsonwebtoken");

const auth = async (req, res, next) => {
  const token = req.headers.authorization.split(" ")[1];
  console.log(token);

  if (!token) {
    res.status(404).send({ message: "please login first" });
  }
  try {
    const decode = jwt.verify(token, "shhhh");
    console.log("decodes", decode);
    res.status(200).send({ message: "success full" });
  } catch (error) {
    console.log("error is", error);
    res.status(404).send({ message: "Token expired" });
  }

  return next();
};

module.exports = auth;

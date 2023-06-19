const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcryptjs = require("bcryptjs");
const cookieparser = require("cookie-parser");
const nodemailer = require("nodemailer");
var bodyParser = require("body-parser");
const auth = require("./middleware/auth");
const app = express();
app.use(cookieparser());
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

const con = mongoose.connect(`mongodb://0.0.0.0:27017/myloginregdb`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.get("/", (req, res) => {
  res.send("my api");
  console.log("be started Api");
});

const sendvarificationmail = async (name, email, user_id) => {
  try {
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      requireTLS: true,
      auth: {
        user: "shifab@lanatussystems.com",
        pass: "fdvaqrlpebkewsvk",
      },
    });
    console.log("in mail user v id", user_id);
    const mailoptions = {
      from: "shifab@lanatussystems.com",
      to: email,
      subject: "form mail varification",
      html:
        "<p>hii" +
        name +
        '  Please varify your mail click here  <a href="http://localhost:9003/verify?id=' +
        user_id +
        '">verify</a> your mail.</p> ',
    };

    transporter.sendMail(mailoptions, function (error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("mail has benn sent", info.response);
      }
    });
  } catch (error) {
    console.log("erorr for mail is", error);
  }
};
var user = null;
const verifymail = async (req, res) => {
  try {
    const userId = req.query.id;
    var user = User.findOne({ _id: userId });
    const updateInfo = await User.updateOne(
      { _id: userId },
      { $set: { is_varified: 1 } }
    );
    if (user.is_varified) console.log(req.query.id);
    // localStorage.setItem("userdata", JSON.stringify(user));
    res.send({ message: "email varified successfully", user: user });
    console.log(updateInfo);
  } catch (error) {
    console.log("error", error);
  } finally {
  }
};

app.get("/resendmail", async (req, res) => {
  try {
    const { name, email, id } = req.body;
    console.log("name", name, email, id);
    // sendvarificationmail(name, email, id);
  } catch (error) {
    console.log("resend backend error is ,", error);
  }
});
app.get("/verify", verifymail);
app.get("/varifymail", (req, res) => {
  res.send({ user: "hello" });
});
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      const user = await User.findOne({ email: email });
      const correctpass = await bcryptjs.compare(password, user.password);
      console.log("pass", correctpass);
      console.log(user);

      if (user && correctpass) {
        console.log(user, password);
        const token = jwt.sign(
          {
            id: user._id,
          },
          "shhhh",
          {
            expiresIn: "1h",
          }
        );
        (user.token = token), (user.password = undefined);

        res.status(200).send({
          user: user,
        });
      } else {
        res.status(404).send({ message: "Username or Password is  Incorrect" });
      }
    }
  } catch (err) {
    console.log("err is", err);
  }
});
app.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const useremail = User.findOne({ email: email });
    const encryptpass = await bcryptjs.hash(password, 10);
    // console.log("email is", useremail);
    User.findOne({ email: email })
      .then(async (user) => {
        console.log("user is", user);
        if (user) {
          return res.status(400).send({
            error: "User Exist",
          });
        } else {
          const user = new User({
            name,
            email,
            password,
            is_varified: 0,
          });

          // const user = User.create({
          //   name,
          //   email,
          //   password: encryptpass,
          // });
          const userdata = await user.save();

          console.log("id is", user);
          const mail = sendvarificationmail(name, email, user._id);
          // user.token = token;
          user.password = undefined;

          res.status(200).json({ user: user });
          // user.save().then(
          //   (data) => {
          //     return res.status(200).send({
          //       data,
          //       Message: "User is created",
          //     });
          //   },
          //   (err) => {
          //     console.log(err);
          //   }
          // );
        }
      })
      .catch((error) => {
        console.log("error", error);
      });
    //   user.save((err) => {
    //     if (err) {
    //       res.send(err);
    //       console.log(err);
    //     } else {
    //       res.send({ message: "success" });
    //       console.log("successs");
    //     }
    //   });
  } catch (err) {
    res.send({ message: "err is " });
    console.log(err);
  }
});
console.log(con);
if (con) {
  console.log("started connected", con);
}

app.get("/home", auth, async (req, res) => {
  // const user = await User.find();
});
const UserSchema = mongoose.Schema({
  name: String,
  email: String,
  password: String,
  token: String,
  is_varified: {
    type: Number,
    default: 0,
  },
});
const User = mongoose.model("User", UserSchema);
app.use(bodyParser.json());
app.listen(9003, () => {
  console.log("started 9003");
});

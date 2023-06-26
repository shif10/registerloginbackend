const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const cookieparser = require("cookie-parser");
const nodemailer = require("nodemailer");
var bodyParser = require("body-parser");
const auth = require("./middleware/auth");
const app = express();
const session = require("express-session");
const config = require("./config/config");
app.use(cookieparser());
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());
app.use(session({ secret: config.session_secret }));
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
        '  Please varify your mail click here  <a href="http://localhost:3000/varifymail/' +
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
const sendvarificationmailforresetpassword = async (name, email, user_id) => {
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
      subject: "form Reset password",
      html:
        "<p>hii" +
        name +
        '  Please varify your mail click here  <a href="http://localhost:3000/resetpassword/' +
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
    const { userId } = req.body;
    console.log("userid ", userId);

    const updateInfo = await User.updateOne(
      { _id: userId },
      { $set: { is_varified: 1 } }
    );
    var user = await User.findById(userId);
    if (user?.is_varified === 1) {
      console.log("is varified", user?.is_varified);

      res
        .status(200)
        .send({ message: "email varified successfully", user: user });
    } else {
      console.log("not varified");
      res.status(204).send({ message: "not varified yet" });
    }
    console.log(updateInfo);
  } catch (error) {
    console.log("error", error);
  } finally {
  }
};

app.post("/resendmail", async (req, res) => {
  try {
    console.log("hello resend");
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    console.log("your name", user?.email);
    if (user) {
      if (user.is_varified === 1) {
        res.status(400).send({ message: "allready varified" });
      } else {
        sendvarificationmail(user.name, email, user.id);
        res.send("user get it");
      }
    } else {
      res.status(400).send({ message: "user not found " });
    }
  } catch (error) {
    console.log("resend backend error is ,", error);
  }
});
app.post("/");
app.post("/verify", verifymail);

app.post("/resetasswordmail", async (req, res) => {
  try {
    console.log("hello resend");
    const { email } = req.body;
    const user = await User.findOne({ email: email });
    console.log("your name", email);
    if (user) {
      sendvarificationmailforresetpassword(user.name, email, user.id);
      res.status(200).send({ message: "succes" });
    } else {
      res.status(400).send({ message: "user not found " });
    }
  } catch (error) {
    console.log("resend backend error is ,", error);
  }
});
app.post("/resetpassword", async (req, res) => {
  console.log("reset");
  try {
    const { password, id } = req.body;
    const securepass = await bcrypt.hash(password, 10);
    const updateinfo = await User.findByIdAndUpdate(
      {
        _id: id,
      },
      {
        $set: { password: securepass },
      }
    ).then(
      () => {
        console.log(res);
        res.status(200).send({ message: "pass updated succesfuly" });
      },
      (err) => {
        console.log("errrrrrrrrrr", err);
      }
    );
    console.log("updated password", updateinfo);
  } catch (err) {
    console.log("error", err);
  }
});
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (email && password) {
      console.log("email", email, "password", password);
      const user = await User.findOne({ email: email });
      console.log("user pass", user?.password, "body pass", password);
      if (user) {
        const correctpass = await bcrypt.compare(password, user.password);
        console.log("pass compare", correctpass);
        if (correctpass) {
          console.log("pass", correctpass);
          console.log(user);
          console.log(user, password);
          const token = jwt.sign(
            {
              id: user._id,
            },
            "shhhh",
            {
              expiresIn: "6h",
            }
          );
          (user.token = token), (user.password = undefined);

          res.status(200).send({
            user: user,
          });
        } else {
          res
            .status(404)
            .send({ message: "Username or Password is  Incorrect" });
        }
      } else {
        res.status(404).send({ message: "username not found" });
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
    const encryptpass = await bcrypt.hash(password, 10);
    // console.log("email is", useremail);
    User.findOne({ email: email })
      .then(async (user) => {
        console.log("user is", user);
        if (user) {
          return res.status(400).send({
            error: "User Already Exist",
          });
        } else {
          const user = new User({
            name,
            email,
            password: encryptpass,
            is_varified: 0,
          });

          // const user = User.create({
          //   name,
          //   email,
          //   password: encryptpass,
          // });
          const userdata = await user.save();

          console.log("id is", user);
          // req.session.user_id = user._id;
          const mail = sendvarificationmail(name, email, user._id);
          // var id = req.session.user_id;
          // console.log("session id", id);
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
app.post("/deleteaccount", async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email: email });
  console.log("user id delete", user._id);
  if (user) {
    const deleteaccount = await User.deleteOne({ _id: user._id }).then(
      (resp) => {
        res.status(200).send({ message: "Account deleted" });
        console.log("resp", resp);
      },
      (err) => {
        res.status(500).send({ message: "somthing went wrong" });
        console.log("delete error", err);
      }
    );
  }
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

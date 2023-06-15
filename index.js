import express, { urlencoded } from "express";
import cors from "cors";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import bcryptjs from "bcryptjs";
import cookieParser from "cookie-parser";
const app = express();
app.use(express.json());
app.use(express.urlencoded());
app.use(cors());

app.use(cookieParser());
const con = mongoose.connect(`mongodb://0.0.0.0:27017/myloginregdb`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.get("/", (req, res) => {
  res.send("my api");
  console.log("be started Api");
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
            expiresIn: "6h",
          }
        );
        (user.token = token), (user.password = undefined);
        // res.status(201).json({ user: user });

        const options = {
          expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          httpOnly: true,
        };
        res.status(200).cookie("token", token, options).json({
          success: true,
          token,
          user: user,
        });
      } else {
        res.status(404).send({ message: "User not registerd yet" });
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
      .then((user) => {
        console.log("user is", user);
        if (user) {
          return res.status(400).send({
            error: "User Exist",
          });
        } else {
          // const user = new User({
          //   name,
          //   email,
          //   password,
          // });

          const user = User.create({
            name,
            email,
            password: encryptpass,
          });

          const token = jwt.sign(
            {
              id: user._id,
              email: email,
            },
            "shhhh",
            { expiresIn: "6h" }
          );
          user.token = token;
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

const UserSchema = mongoose.Schema({
  name: String,
  email: String,
  password: String,
  token: String,
});
const User = mongoose.model("User", UserSchema);

app.listen(9003, () => {
  console.log("started 9003");
});

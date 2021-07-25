require("dotenv").config();
const cors = require("cors");
const port = process.env.PORT;
const databaseUrl = process.env.DATABASE_URL!;
import express from "express";
import mongo from "mongoose";
import fetching from "./endpoints/fetching_controller";
import users from "./endpoints/users";
import sources from "./endpoints/sources";
import news from "./endpoints/news";
import admins from "./endpoints/admins";
import favourite from "./endpoints/favourites";
import countries from "./endpoints/countries";
import notificatons from "./endpoints/notification_topic";
import user_preferences from "./endpoints/user_preferences";
import { json } from "body-parser";

mongo.set("useFindAndModify", false);
mongo.set("useUnifiedTopology", true);
mongo.set("useNewUrlParser", true);
mongo.connect(databaseUrl);
const app = express();

app.use(
  cors({
    allowedHeaders: [
      "content-type, authorization, provider, x-api-key, Accept",
    ],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS",
  })
);
app.use(json());
app.use(news);
app.use(users);
app.use(admins);
app.use(sources);
app.use(fetching);
app.use(countries);
app.use(favourite);
app.use(notificatons);
app.use(user_preferences);

app.listen(port, () => console.log(`listening on port ${port}`));

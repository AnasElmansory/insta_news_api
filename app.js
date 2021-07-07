require("dotenv").config();
const port = process.env.PORT;
const databaseUrl = process.env.DATABASE_URL;
const app = require("express")();
const mongo = require("mongoose");
const cors = require("cors");
const fetching = require("./endpoints/fetching_controller");
const users = require("./endpoints/users");
const sources = require("./endpoints/sources");
const news = require("./endpoints/news");
const admins = require("./endpoints/admins");
const favourite = require("./endpoints/favourites");
const countries = require("./endpoints/countries");
const notificatons = require("./endpoints/notification_topic");
const { json } = require("body-parser");

mongo.set("useFindAndModify", false);
mongo.set("useUnifiedTopology", true);
mongo.set("useNewUrlParser", true);
mongo.connect(databaseUrl);

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
app.user(notificatons);

app.listen(port, () => console.log(`listening on port ${port}`));

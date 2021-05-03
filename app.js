require("dotenv").config();
const port = process.env.PORT;
const databaseUrl = process.env.DATABASE_URL;
const app = require("express")();
const mongo = require("mongoose");

const { allowOrigin } = require("./utils/helper");
const fetching = require("./endpoints/fetching_controller");
const users = require("./endpoints/users");
const sources = require("./endpoints/sources");
const news = require("./endpoints/news");
const admins = require("./endpoints/admins");
const favourite = require("./endpoints/favourites");

mongo.set("useFindAndModify", false);
mongo.set("useUnifiedTopology", true);
mongo.set("useNewUrlParser", true);
mongo.connect(databaseUrl);

app.use(news);
app.use(users);
app.use(admins);
app.use(sources);
app.use(fetching);
app.use(favourite);
app.use(allowOrigin);

app.listen(port, () => console.log(`listening on port ${port}`));

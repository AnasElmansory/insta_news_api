const router = require("express").Router();
const { authorizeUser } = require("../authentication/auth");
const { errorHandler } = require("../utils/helper");
const { bearerToken } = require("../config");
const axios = require("axios").default;
router.get("/api/video", authorizeUser, errorHandler, async (req, res) => {
  const { id } = req.query;
  const result = await axios.get(
    `https://api.twitter.com/1.1/statuses/show.json?id=${id}`,
    {
      headers: {
        Authorization: `bearer ${bearerToken}`,
      },
    }
  );
  const { extended_entities } = result.data;
  res.send(extended_entities);
});

module.exports = router;

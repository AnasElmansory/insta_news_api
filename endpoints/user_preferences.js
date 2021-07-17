const router = require("express").Router();
const FollowSource = require("../models/follow_source");
const Favorite = require("../models/favourite");
const { authorizeUser } = require("../authentication/auth");
const { errorHandler } = require("../utils/helper");

router.post(
  "/api/save/favorite",
  authorizeUser,
  errorHandler,
  async (req, res) => {
    const { userId } = req.params;
    const { guestId } = req.query;
    const guestFavorites = await Favorite.findOne({ userId: guestId });
    if (!guestFavorites) {
      return res.send();
    }

    const { favNewsIds } = guestFavorites;
    const userExists = await Favorite.exists({ userId });
    let result;
    if (userExists) {
      result = await Favorite.findOneAndUpdate(
        { userId },
        { $addToSet: { favNewsIds } }
      );
    } else {
      result = await Favorite.create({ userId, favNewsIds });
    }
    await Favorite.findOneAndDelete({ userId: guestId });
    res.send(result);
  }
);

router.post(
  "/api/save/follows",
  authorizeUser,
  errorHandler,
  async (req, res) => {
    const { userId } = req.params;
    const { guestId } = req.query;
    const guestFollows = await FollowSource.findOne({ userId: guestId });

    if (!guestFollows) {
      return res.send("empty");
    }
    const { follows } = guestFollows;
    const userExists = await FollowSource.exists({ userId });
    let result;
    if (userExists) {
      result = await FollowSource.findOneAndUpdate(
        { userId },
        { $addToSet: { follows } }
      );
    } else {
      result = await FollowSource.create({ userId, follows });
    }
    await FollowSource.findOneAndDelete({ userId: guestId });
    res.send(result);
  }
);

module.exports = router;

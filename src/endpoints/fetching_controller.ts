import express from "express";
import { stringify } from "flatted";
import {
  checkFeedingState,
  startTwitFeed,
  stopTwitFeed,
} from "../utils/tweets_feed_handler";

import { authorizeUser, authorizeAdmin } from "../authentication/auth";
import errorHandler from "../utils/helper";

const router = express.Router();
router.get(
  "/control/feeding",
  authorizeUser,
  authorizeAdmin,
  errorHandler,
  async (req: any, res: any) => {
    const isFeeding = checkFeedingState();
    res.json({ feeding: isFeeding });
  }
);
router.post(
  "/control/startfeeding",
  authorizeUser,
  // authorizeAdmin,
  errorHandler,
  async (req: any, res: any) => {
    const { max_result } = req.query;
    const _id = await startTwitFeed();
    const isFeeding = _id !== undefined;
    res.json({ id: stringify(_id), feeding: isFeeding });
  }
);
router.post(
  "/control/stopfeeding",
  authorizeUser,
  // authorizeAdmin,
  errorHandler,
  async (req: any, res: any) => {
    const { result, id } = stopTwitFeed();
    const isFeeding = id !== undefined;
    res.json({ result, id, feeding: isFeeding });
  }
);

export default router;

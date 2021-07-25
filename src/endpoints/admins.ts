import express from "express";
import Admin from "../models/admin";
import { authorizeUser } from "../authentication/auth";
import errorHandler from "../utils/helper";

const router = express.Router();

router.get(
  "/api/admins/:id",
  authorizeUser,
  errorHandler,
  async (req: any, res: any) => {
    const { id } = req.params;
    const admin = await Admin.findOne({ id });
    res.send(admin);
  }
);

router.get(
  "/api/is/admin/:id",
  authorizeUser,
  errorHandler,
  async (req: any, res: any) => {
    const { id } = req.params;
    const isAdmin = await Admin.exists({ id });
    res.send(isAdmin);
  }
);

export default router;

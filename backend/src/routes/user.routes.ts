import { Router } from "express";
import { authMiddleware } from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/profile",
  authMiddleware,
  (req, res) => {
    res.json({
      message: "Protected Route",
    });
  }
);

export default router;
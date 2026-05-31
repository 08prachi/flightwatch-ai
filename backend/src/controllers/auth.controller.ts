import { Request, Response } from "express";

import { AuthService } from "../services/auth.service";

const authService = new AuthService();

export class AuthController {
  async register(
    req: Request,
    res: Response
  ) {
    try {
      const user =
        await authService.register(
          req.body.name,
          req.body.email,
          req.body.password
        );

      return res.status(201).json(user);
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      });
    }
  }

  async login(
    req: Request,
    res: Response
  ) {
    try {
      const result =
        await authService.login(
          req.body.email,
          req.body.password
        );

      return res.json(result);
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Something went wrong",
      });
    }
  }

  async logout(
    req: Request,
    res: Response
  ) {
    return res.json({ success: true });
  }

  async changePassword(
    req: Request,
    res: Response
  ) {
    try {
      const { currentPassword, newPassword } = req.body;
      const userId = (req as any).userId;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      await authService.changePassword(userId, currentPassword, newPassword);
      return res.json({ success: true });
    } catch (error) {
      return res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Password change failed",
      });
    }
  }
}
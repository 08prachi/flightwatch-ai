"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthController = void 0;
const auth_service_1 = require("../services/auth.service");
const authService = new auth_service_1.AuthService();
class AuthController {
    async register(req, res) {
        try {
            const user = await authService.register(req.body.name, req.body.email, req.body.password);
            return res.status(201).json(user);
        }
        catch (error) {
            return res.status(400).json({
                message: error instanceof Error
                    ? error.message
                    : "Something went wrong",
            });
        }
    }
    async login(req, res) {
        try {
            const result = await authService.login(req.body.email, req.body.password);
            return res.json(result);
        }
        catch (error) {
            return res.status(400).json({
                message: error instanceof Error
                    ? error.message
                    : "Something went wrong",
            });
        }
    }
    async logout(req, res) {
        return res.json({ success: true });
    }
    async changePassword(req, res) {
        try {
            const { currentPassword, newPassword } = req.body;
            const userId = req.userId;
            if (!userId) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            await authService.changePassword(userId, currentPassword, newPassword);
            return res.json({ success: true });
        }
        catch (error) {
            return res.status(400).json({
                message: error instanceof Error
                    ? error.message
                    : "Password change failed",
            });
        }
    }
}
exports.AuthController = AuthController;

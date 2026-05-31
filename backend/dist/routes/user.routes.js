"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_middleware_1 = require("../middleware/auth.middleware");
const router = (0, express_1.Router)();
router.get("/profile", auth_middleware_1.authMiddleware, (req, res) => {
    res.json({
        message: "Protected Route",
    });
});
exports.default = router;

"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_routes_1 = __importDefault(require("./routes/auth.routes"));
const user_routes_1 = __importDefault(require("./routes/user.routes"));
const watchlist_routes_1 = __importDefault(require("./routes/watchlist.routes"));
const notification_routes_1 = __importDefault(require("./routes/notification.routes"));
const search_routes_1 = __importDefault(require("./routes/search.routes"));
require("./workers/priceCheck.worker");
require("./schedulers/watchlist.scheduler");
require("./workers/notification.worker");
dotenv_1.default.config();
const app = (0, express_1.default)();
// CORS middleware
app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    if (req.method === "OPTIONS") {
        return res.sendStatus(200);
    }
    next();
});
app.use(express_1.default.json());
app.use("/api/user", user_routes_1.default);
app.use("/api/watchlists", watchlist_routes_1.default);
app.use("/api/notifications", notification_routes_1.default);
app.use("/api", search_routes_1.default);
app.use("/api/auth", auth_routes_1.default);
app.get("/health", (_req, res) => {
    res.json({
        status: "ok",
    });
});
app.listen(3000, () => {
    console.log("🚀 Server Running on Port 3000");
});

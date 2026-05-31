"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
exports.notificationQueue = new bullmq_1.Queue("notification-queue", {
    connection: redis_1.connection,
});

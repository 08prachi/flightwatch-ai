"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.priceCheckQueue = void 0;
const bullmq_1 = require("bullmq");
const redis_1 = require("../config/redis");
exports.priceCheckQueue = new bullmq_1.Queue("price-check-queue", {
    connection: redis_1.connection,
    defaultJobOptions: {
        attempts: 3,
        removeOnComplete: 100,
        removeOnFail: 50,
    },
});

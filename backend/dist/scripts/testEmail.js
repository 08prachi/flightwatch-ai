"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const email_service_1 = require("../services/email.service");
async function main() {
    await (0, email_service_1.sendEmail)("guptaprachi510@gmail.com", "FlightWatch Test", "<h1>Email Working 🎉</h1>");
    console.log("Email Sent");
}
main().catch(console.error);

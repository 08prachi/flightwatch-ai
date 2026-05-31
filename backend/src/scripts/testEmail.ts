import dotenv from "dotenv";
dotenv.config();

import { sendEmail } from "../services/email.service";

async function main() {
  await sendEmail(
    "guptaprachi510@gmail.com",
    "FlightWatch Test",
    "<h1>Email Working 🎉</h1>"
  );

  console.log("Email Sent");
}

main().catch(console.error);
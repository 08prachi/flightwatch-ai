"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.emailService = void 0;
exports.sendEmail = sendEmail;
const nodemailer_1 = __importDefault(require("nodemailer"));
class EmailService {
    transporter;
    constructor() {
        this.transporter = nodemailer_1.default.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS?.trim(),
            },
        });
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.warn("⚠️  Email credentials not configured");
        }
    }
    baseTemplate(content) {
        return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; }
            .container { max-width: 600px; margin: 0 auto; padding: 0; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px 20px; text-align: center; }
            .header h1 { margin: 0; font-size: 28px; }
            .content { background: #f9f9f9; padding: 30px 20px; }
            .inner { background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
            .highlight { color: #667eea; font-weight: bold; }
            .button { display: inline-block; background: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 15px 0; }
            .button:hover { background: #764ba2; }
            .price { font-size: 28px; font-weight: bold; color: #667eea; }
            .footer { background: #f0f0f0; padding: 20px; text-align: center; color: #666; font-size: 12px; }
            .footer a { color: #667eea; text-decoration: none; }
            .stat { display: inline-block; width: 45%; margin: 10px 2.5%; background: #f0f0f0; padding: 15px; border-radius: 8px; text-align: center; }
            .stat-number { font-size: 24px; font-weight: bold; color: #667eea; }
            .alert-box { border-left: 4px solid #48bb78; background: #f0fdf4; padding: 15px; border-radius: 4px; margin: 15px 0; }
            .alert-box.warning { border-left-color: #f5576c; background: #fff5f7; }
            .badge { display: inline-block; background: #48bb78; color: white; padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; }
            .badge.savings { background: #48bb78; }
          </style>
        </head>
        <body>
          <div class="container">
            ${content}
          </div>
        </body>
      </html>
    `;
    }
    async sendEmail(options) {
        try {
            console.log(`📧 Sending email to: ${options.to}`);
            const mailOptions = {
                from: `FlightWatch AI <${process.env.EMAIL_USER}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text || options.html,
            };
            if (options.attachments && options.attachments.length > 0) {
                mailOptions.attachments = options.attachments;
            }
            const result = await this.transporter.sendMail(mailOptions);
            console.log(`✅ Email sent successfully: ${result.messageId}`);
            return true;
        }
        catch (error) {
            console.error(`❌ Failed to send email: ${error.message}`);
            throw error;
        }
    }
    async sendPriceDropAlert(email, userName, route, currentPrice, lowestPrice, savings, savingsPercentage) {
        const html = this.baseTemplate(`
      <div class="header">
        <h1>📉 Price Drop Alert!</h1>
        <p>Great news, ${userName}!</p>
      </div>
      <div class="content">
        <div class="inner">
          <h2 style="color: #333; margin-top: 0;">Flight Price Decreased</h2>
          <p>The price for your flight watch has dropped significantly!</p>

          <div class="alert-box">
            <p style="margin: 0;"><strong>Route:</strong> ${route}</p>
            <p style="margin: 5px 0 0 0;"><strong>Previous Lowest:</strong> <span style="text-decoration: line-through;">$${lowestPrice}</span></p>
            <p style="margin: 5px 0; font-size: 20px;"><strong>Current Price: <span class="price">$${currentPrice}</span></strong></p>
            <span class="badge savings">💰 Save $${savings} (${savingsPercentage}%)</span>
          </div>

          <p>This is the best price we've tracked for this route. Book now before prices go back up!</p>

          <center>
            <a href="https://flightwatch.ai/watchlist" class="button">View All Watches →</a>
          </center>
        </div>
        <p style="text-align: center; color: #666; font-size: 14px;">
          Don't want these alerts? <a href="https://flightwatch.ai/settings" style="color: #667eea;">Manage preferences</a>
        </p>
      </div>
      <div class="footer">
        <p>© 2024 FlightWatch AI. All rights reserved.</p>
      </div>
    `);
        return this.sendEmail({
            to: email,
            subject: `📉 Great Deal! ${route} dropped to $${currentPrice}`,
            html,
        });
    }
    async sendBudgetAlert(email, userName, route, currentPrice, budget, available) {
        const html = this.baseTemplate(`
      <div class="header" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
        <h1>✨ Within Your Budget!</h1>
        <p>Your flight watch has reached your target price!</p>
      </div>
      <div class="content">
        <div class="inner">
          <h2 style="color: #333; margin-top: 0;">Perfect Time to Book</h2>
          <p>Hi ${userName},</p>
          <p>The flight you were watching is now within your budget!</p>

          <div class="alert-box">
            <p style="margin: 0;"><strong>Route:</strong> ${route}</p>
            <p style="margin: 5px 0 0 0;"><strong>Current Price:</strong> <span class="price">$${currentPrice}</span></p>
            <p style="margin: 5px 0;"><strong>Your Budget:</strong> $${budget}</p>
            <p style="color: #48bb78; font-size: 16px; font-weight: bold; margin: 10px 0;">💰 Under Budget by: $${available}</p>
          </div>

          <p>This is a great time to book your flight! Prices may increase again soon.</p>

          <center>
            <a href="https://flightwatch.ai/search" class="button" style="background: #f5576c;">Book Your Flight Now →</a>
          </center>
        </div>
        <p style="text-align: center; color: #666; font-size: 14px;">
          Update your budget: <a href="https://flightwatch.ai/settings" style="color: #f5576c;">Manage preferences</a>
        </p>
      </div>
      <div class="footer">
        <p>© 2024 FlightWatch AI. All rights reserved.</p>
      </div>
    `);
        return this.sendEmail({
            to: email,
            subject: `✨ Good News! ${route} is within your budget - $${currentPrice}`,
            html,
        });
    }
    async sendWeeklyDigest(email, userName, stats) {
        const html = this.baseTemplate(`
      <div class="header">
        <h1>📊 Your Weekly Report</h1>
        <p>Here's what happened with your flight watches this week</p>
      </div>
      <div class="content">
        <div class="inner">
          <p>Hi ${userName},</p>
          <p>Here's your FlightWatch AI weekly summary:</p>

          <div style="text-align: center;">
            <div class="stat">
              <div class="stat-number">${stats.totalWatches}</div>
              <div style="color: #666; margin-top: 5px;">Active Watches</div>
            </div>
            <div class="stat">
              <div class="stat-number">${stats.priceDrops}</div>
              <div style="color: #666; margin-top: 5px;">Price Drops</div>
            </div>
          </div>

          <div class="alert-box" style="text-align: center; margin-top: 20px;">
            <p style="margin: 0;"><strong>💰 Total Savings This Week:</strong></p>
            <p style="font-size: 24px; color: #48bb78; margin: 10px 0; font-weight: bold;">$${stats.totalSavings}</p>
            <p style="margin: 10px 0;"><strong>🎉 Best Deal:</strong> ${stats.bestDeal}</p>
          </div>

          <center>
            <a href="https://flightwatch.ai/dashboard" class="button">View Your Dashboard →</a>
          </center>
        </div>
      </div>
      <div class="footer">
        <p>© 2024 FlightWatch AI. All rights reserved.</p>
      </div>
    `);
        return this.sendEmail({
            to: email,
            subject: `📊 Your Weekly Report - ${stats.priceDrops} Price Drops! 🎉`,
            html,
        });
    }
    async sendSignupConfirmation(email, userName) {
        const html = this.baseTemplate(`
      <div class="header">
        <h1>Welcome to FlightWatch AI! 🎉</h1>
      </div>
      <div class="content">
        <div class="inner">
          <p>Hi ${userName},</p>
          <p>Thank you for joining FlightWatch AI! We're excited to help you find the best flight deals.</p>

          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #333; margin-top: 0;">Getting Started:</h3>
            <ol style="margin: 0; padding-left: 20px;">
              <li>Create your first flight watch</li>
              <li>Set your budget and preferences</li>
              <li>Receive instant alerts when prices drop</li>
              <li>Book your flight at the best time</li>
            </ol>
          </div>

          <center>
            <a href="https://flightwatch.ai/search" class="button">Create Your First Watch →</a>
          </center>
        </div>
      </div>
      <div class="footer">
        <p>© 2024 FlightWatch AI. All rights reserved.</p>
      </div>
    `);
        return this.sendEmail({
            to: email,
            subject: "Welcome to FlightWatch AI! 🎉",
            html,
        });
    }
    async sendPriceAnalysis(email, userName, route, top3Cheapest, bestDay, currencySymbol = '$') {
        const flightsList = top3Cheapest
            .map((f) => `
      <tr style="border-bottom: 1px solid #e0e0e0; background: ${f.rank === 1 ? '#f0fdf4' : 'white'};">
        <td style="padding: 12px; text-align: center; font-weight: bold; color: #667eea;">#${f.rank}</td>
        <td style="padding: 12px;">
          <strong style="font-size: 18px; color: #48bb78;">${currencySymbol}${f.price}</strong>
        </td>
        <td style="padding: 12px;">
          <strong>${f.date}</strong><br>
          <span style="color: #666; font-size: 12px;">${f.airline}</span>
        </td>
        <td style="padding: 12px; font-size: 13px;">
          <div>⏰ ${f.departure || 'N/A'} → ${f.arrival || 'N/A'}</div>
          <div style="color: #666;">⏱️ ${Math.floor(f.duration / 60)}h ${f.duration % 60}m</div>
          <div style="color: #666;">🛫 ${f.stops} ${f.stops === 1 ? 'stop' : 'stops'}</div>
        </td>
      </tr>
    `)
            .join("");
        const html = this.baseTemplate(`
      <div class="header">
        <h1>✈️ Flight Prices Found!</h1>
        <p>We found great options for ${route}</p>
      </div>
      <div class="content">
        <div class="inner">
          <p>Hi ${userName},</p>
          <p>Here are the top 3 cheapest flights for your route in the next 7 days:</p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 12px; text-align: center; font-weight: bold; width: 10%;">Rank</th>
                <th style="padding: 12px; font-weight: bold; width: 20%;">Price</th>
                <th style="padding: 12px; font-weight: bold; width: 30%;">Date & Airline</th>
                <th style="padding: 12px; font-weight: bold; width: 40%;">Flight Details</th>
              </tr>
            </thead>
            <tbody>
              ${flightsList}
            </tbody>
          </table>

          <div class="alert-box" style="border-left-color: #667eea; background: #f0f4ff; margin-top: 20px;">
            <p style="margin: 0;"><strong>🏆 Best Day to Fly:</strong></p>
            <p style="margin: 10px 0 0 0; font-size: 18px;">
              <span style="color: #667eea; font-weight: bold;">${bestDay.date}</span>
              <span style="color: #48bb78; font-size: 20px; font-weight: bold;">${currencySymbol}${bestDay.lowestPrice}</span>
            </p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 14px;">
              Average price that day: ${currencySymbol}${bestDay.avgPrice}
            </p>
          </div>

          <p style="color: #666; margin-top: 20px; line-height: 1.8;">
            <strong>✈️ Top Tips:</strong><br>
            • These are the lowest prices we found across all departure dates in the next 7 days<br>
            • <strong>${bestDay.date}</strong> is the cheapest day to fly for this route<br>
            • Book early to secure these prices before they increase<br>
            • Flight times include all connections and waiting periods
          </p>

          <center>
            <a href="https://flightwatch.ai/dashboard" class="button">View Your Watches →</a>
          </center>
        </div>
      </div>
      <div class="footer">
        <p>© 2024 FlightWatch AI. All rights reserved.</p>
      </div>
    `);
        return this.sendEmail({
            to: email,
            subject: `✈️ ${route} - Top 3 Cheapest Flights! Lowest: ${currencySymbol}${top3Cheapest[0].price}`,
            html,
        });
    }
    async sendPriceAnalysisWithPDF(email, userName, route, top3Cheapest, pdfBuffer, currencySymbol = '$') {
        const flightsList = top3Cheapest
            .map((f) => `
      <tr style="border-bottom: 1px solid #e0e0e0; background: ${f.rank === 1 ? '#f0fdf4' : 'white'};">
        <td style="padding: 12px; text-align: center; font-weight: bold; color: #667eea;">#${f.rank}</td>
        <td style="padding: 12px;">
          <strong style="font-size: 18px; color: #48bb78;">${currencySymbol}${f.price}</strong>
        </td>
        <td style="padding: 12px;">
          <strong>${f.date}</strong><br>
          <span style="color: #666; font-size: 12px;">${f.airline}</span>
        </td>
        <td style="padding: 12px; font-size: 13px;">
          <div>⏰ ${f.departureTime || 'N/A'} → ${f.arrivalTime || 'N/A'}</div>
          <div style="color: #666;">⏱️ ${f.duration}m</div>
          <div style="color: #666;">🛫 ${f.stops === 0 ? 'Non-stop' : f.stops + ' stop(s)'}</div>
        </td>
      </tr>
    `)
            .join("");
        const html = this.baseTemplate(`
      <div class="header">
        <h1>✈️ Flight Watch Results - ${route}</h1>
        <p>We found great flight options for you!</p>
      </div>
      <div class="content">
        <div class="inner">
          <p>Hi ${userName},</p>
          <p>We've searched multiple dates and found the best available fares for your flight watch. Here are the top 3 cheapest flights:</p>

          <table style="width: 100%; border-collapse: collapse; margin: 20px 0; background: white;">
            <thead>
              <tr style="background: #f5f5f5;">
                <th style="padding: 12px; text-align: center; font-weight: bold; width: 10%;">Rank</th>
                <th style="padding: 12px; font-weight: bold; width: 20%;">Price</th>
                <th style="padding: 12px; font-weight: bold; width: 30%;">Date & Airline</th>
                <th style="padding: 12px; font-weight: bold; width: 40%;">Flight Details</th>
              </tr>
            </thead>
            <tbody>
              ${flightsList}
            </tbody>
          </table>

          <div class="alert-box" style="border-left-color: #667eea; background: #f0f4ff;">
            <p style="margin: 0;"><strong>📎 Attached PDF Report:</strong></p>
            <p style="margin: 10px 0 0 0; color: #666;">
              We've attached a complete Flight Watch Report with:
            </p>
            <ul style="margin: 10px 0; color: #666;">
              <li>Top 3 cheapest flights (highlighted)</li>
              <li>Fare analysis and statistics</li>
              <li>Complete list of all flights found</li>
              <li>Search summary and timestamps</li>
            </ul>
          </div>

          <p style="color: #666; margin-top: 20px; line-height: 1.8;">
            <strong>💡 Next Steps:</strong><br>
            • Review the attached PDF for all available options<br>
            • Click on the flight to book directly with the provider<br>
            • We'll continue monitoring prices for you<br>
            • You'll receive alerts if prices drop further
          </p>

          <center>
            <a href="https://flightwatch.ai/watchlist" class="button">View Your Watchlist →</a>
          </center>
        </div>
      </div>
      <div class="footer">
        <p>© 2024 FlightWatch AI. All rights reserved.</p>
      </div>
    `);
        return this.sendEmail({
            to: email,
            subject: `✈️ Flight Watch Results - ${route} | ${currencySymbol}${top3Cheapest[0].price}`,
            html,
            attachments: [
                {
                    filename: 'flight-watch-report.pdf',
                    content: pdfBuffer,
                    contentType: 'application/pdf',
                },
            ],
        });
    }
}
exports.emailService = new EmailService();
// Legacy function for backward compatibility
async function sendEmail(to, subject, html) {
    return exports.emailService.sendEmail({ to, subject, html });
}

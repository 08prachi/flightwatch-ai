"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pdfGenerationService = void 0;
const pdfkit_1 = __importDefault(require("pdfkit"));
class PDFGenerationService {
    generateFlightReport(options) {
        return new Promise((resolve, reject) => {
            const { watchlist, allFlights, top3Flights, statistics } = options;
            const doc = new pdfkit_1.default({
                bufferPages: true,
                margin: 40,
            });
            const chunks = [];
            doc.on('data', (chunk) => chunks.push(chunk));
            doc.on('end', () => resolve(Buffer.concat(chunks)));
            doc.on('error', reject);
            try {
                // Header
                this.addHeader(doc, watchlist, statistics);
                // Summary Statistics
                this.addSummary(doc, statistics);
                // Top 3 Cheapest Flights
                this.addTop3Flights(doc, top3Flights);
                // Page break before complete list
                doc.addPage();
                // Complete Flight List
                this.addCompleteFlightList(doc, allFlights);
                // Footer
                this.addFooter(doc);
                doc.end();
            }
            catch (error) {
                doc.end();
                reject(error);
            }
        });
    }
    addHeader(doc, watchlist, statistics) {
        const now = new Date();
        const generatedDate = now.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
        // Title
        doc.fontSize(28).font('Helvetica-Bold').text('Flight Watch Report', { align: 'center' });
        doc.moveDown(0.5);
        // Generated timestamp
        doc
            .fontSize(10)
            .font('Helvetica')
            .fillColor('#666666')
            .text(`Generated: ${generatedDate}`, { align: 'center' });
        doc.moveDown(1.5);
        // Route info
        doc.fontSize(16).font('Helvetica-Bold').fillColor('#000000');
        doc.text(`${watchlist.origin} → ${watchlist.destination}`, { align: 'center' });
        doc.moveDown(0.5);
        // Search window
        doc
            .fontSize(11)
            .font('Helvetica')
            .fillColor('#666666')
            .text(`Search Window: ${statistics.searchWindow.start} to ${statistics.searchWindow.end}`, { align: 'center' });
        doc.moveDown(1);
        // Horizontal line
        doc.moveTo(40, doc.y).lineTo(doc.page.width - 40, doc.y).stroke('#dddddd');
        doc.moveDown(1);
    }
    addSummary(doc, statistics) {
        doc.fontSize(14).font('Helvetica-Bold').fillColor('#000000').text('Search Summary');
        doc.moveDown(0.5);
        // Create stats grid
        const statsData = [
            { label: 'Total Flights Found', value: statistics.totalFlights.toString() },
            { label: 'Dates Searched', value: statistics.datesSearched.toString() },
            { label: 'Cheapest Fare', value: `$${statistics.cheapestFare.toFixed(2)}` },
            {
                label: 'Average Fare',
                value: `$${statistics.averageFare.toFixed(2)}`,
            },
            { label: 'Most Expensive', value: `$${statistics.mostExpensiveFare.toFixed(2)}` },
        ];
        const colWidth = (doc.page.width - 80) / 5;
        statsData.forEach((stat, index) => {
            const x = 40 + index * colWidth;
            const y = doc.y;
            // Draw box
            doc
                .rect(x, y, colWidth - 5, 60)
                .stroke('#0284c7');
            // Label
            doc
                .fontSize(9)
                .font('Helvetica')
                .fillColor('#666666')
                .text(stat.label, x + 8, y + 8, { width: colWidth - 16, align: 'center' });
            // Value
            doc
                .fontSize(12)
                .font('Helvetica-Bold')
                .fillColor('#0284c7')
                .text(stat.value, x + 8, y + 28, { width: colWidth - 16, align: 'center' });
        });
        doc.moveDown(4);
        doc.moveDown(1);
    }
    addTop3Flights(doc, top3Flights) {
        doc
            .fontSize(14)
            .font('Helvetica-Bold')
            .fillColor('#000000')
            .text('Top 3 Cheapest Flights');
        doc.moveDown(0.5);
        top3Flights.forEach((flight) => {
            // Highlight box for rank
            const rankColors = ['#10b981', '#3b82f6', '#f59e0b']; // Green, Blue, Orange
            const rankColor = rankColors[flight.rank - 1];
            doc
                .rect(40, doc.y, doc.page.width - 80, 100)
                .fillAndStroke(rankColor + '15', rankColor);
            doc.fontSize(11).font('Helvetica-Bold').fillColor(rankColor);
            doc.text(`#${flight.rank} - ${flight.airline} (${flight.flightNumber})`, 50, doc.y + 10);
            doc.fontSize(9).font('Helvetica').fillColor('#333333');
            const y = doc.y + 5;
            doc.text(`Flight: ${flight.flightNumber || 'N/A'}`, 50, y);
            doc.text(`Date: ${flight.date}`, 50, y + 16);
            doc.text(`Route: ${flight.origin} → ${flight.destination}`, 50, y + 32);
            doc.text(`Departure: ${flight.departureTime} | Arrival: ${flight.arrivalTime}`, 50, y + 48);
            doc.text(`Duration: ${flight.duration}m | Stops: ${flight.stops === 0 ? 'Non-stop' : flight.stops}`, 50, y + 64);
            doc.fontSize(12).font('Helvetica-Bold').fillColor(rankColor);
            doc.text(`Price: $${flight.price.toFixed(2)}`, 50, y + 80);
            doc.moveDown(6);
        });
        doc.moveDown(1);
    }
    addCompleteFlightList(doc, allFlights) {
        doc
            .fontSize(14)
            .font('Helvetica-Bold')
            .fillColor('#000000')
            .text('Complete Flight List');
        doc.moveDown(0.5);
        // Group flights by date
        const groupedByDate = new Map();
        allFlights.forEach((flight) => {
            if (!groupedByDate.has(flight.date)) {
                groupedByDate.set(flight.date, []);
            }
            groupedByDate.get(flight.date).push(flight);
        });
        // Sort dates
        const sortedDates = Array.from(groupedByDate.keys()).sort();
        sortedDates.forEach((date) => {
            const flights = groupedByDate.get(date);
            const sortedFlights = flights.sort((a, b) => a.price - b.price);
            doc.fontSize(11).font('Helvetica-Bold').fillColor('#0284c7').text(`${date}`);
            doc.moveDown(0.3);
            // Table header
            const tableTop = doc.y;
            const col1 = 40;
            const col2 = 180;
            const col3 = 280;
            const col4 = 380;
            const col5 = 480;
            doc
                .fontSize(9)
                .font('Helvetica-Bold')
                .fillColor('#333333');
            doc.text('Airline', col1, tableTop);
            doc.text('Departure', col2, tableTop);
            doc.text('Arrival', col3, tableTop);
            doc.text('Duration', col4, tableTop);
            doc.text('Price', col5, tableTop);
            doc.moveTo(col1, tableTop + 15).lineTo(doc.page.width - 40, tableTop + 15).stroke('#cccccc');
            doc.moveDown(1.2);
            // Table rows
            sortedFlights.forEach((flight) => {
                const rowTop = doc.y;
                doc
                    .fontSize(8)
                    .font('Helvetica')
                    .fillColor('#666666');
                doc.text(flight.airline, col1, rowTop, { width: 130 });
                doc.text(flight.departureTime, col2, rowTop, { width: 90 });
                doc.text(flight.arrivalTime, col3, rowTop, { width: 90 });
                doc.text(`${flight.duration}m`, col4, rowTop, { width: 90 });
                doc.font('Helvetica-Bold').fillColor('#0284c7');
                doc.text(`$${flight.price.toFixed(2)}`, col5, rowTop, { width: 70, align: 'right' });
                doc.moveDown(0.8);
                // Check if we need a new page
                if (doc.y > doc.page.height - 60) {
                    doc.addPage();
                }
            });
            doc.moveDown(0.5);
        });
    }
    addFooter(doc) {
        const pageCount = doc.bufferedPageRange().count;
        for (let i = 0; i < pageCount; i++) {
            doc.switchToPage(i);
            doc
                .fontSize(9)
                .font('Helvetica')
                .fillColor('#999999')
                .text(`Page ${i + 1} of ${pageCount}`, 40, doc.page.height - 30, { align: 'center' });
            doc.text('FlightWatch - Your Flight Price Tracking Assistant', 40, doc.page.height - 20, {
                align: 'center',
            });
        }
    }
}
exports.pdfGenerationService = new PDFGenerationService();

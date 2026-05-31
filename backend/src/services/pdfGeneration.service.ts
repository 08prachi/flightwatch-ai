import PDFDocument from 'pdfkit';
import { CheapestFlight, AggregatedFlight, FareStatistics } from './flightAggregation.service';

interface PDFGenerationOptions {
  watchlist: {
    id?: string | number;
    origin: string;
    destination: string;
    departureDate: string;
    returnDate?: string | null;
  };
  allFlights: AggregatedFlight[];
  top3Flights: CheapestFlight[];
  statistics: FareStatistics;
}

class PDFGenerationService {
  generateFlightReport(options: PDFGenerationOptions): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const { watchlist, allFlights, top3Flights, statistics } = options;

      const doc = new PDFDocument({
        margin: 35,
        bufferPages: false,
      });

      const chunks: Buffer[] = [];

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', reject);

      try {
        // All content on single document
        this.addContent(doc, watchlist, allFlights, top3Flights, statistics);
        doc.end();
      } catch (error) {
        doc.end();
        reject(error);
      }
    });
  }

  private addContent(
    doc: PDFKit.PDFDocument,
    watchlist: PDFGenerationOptions['watchlist'],
    allFlights: AggregatedFlight[],
    top3Flights: CheapestFlight[],
    statistics: FareStatistics
  ) {
    const now = new Date();
    const generatedDate = now.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

    // HEADER
    doc.fontSize(24).font('Helvetica-Bold').text('Flight Watch Report', { align: 'center' });
    doc.fontSize(9).font('Helvetica').fillColor('#333333');
    doc.text(`Generated: ${generatedDate}`, { align: 'center' });
    doc.moveDown(0.5);

    // Route
    doc.fontSize(18).font('Helvetica-Bold').text(`${watchlist.origin} → ${watchlist.destination}`, { align: 'center' });
    doc.fontSize(8).fillColor('#555555');
    doc.text(`Search: ${statistics.searchWindow.start} to ${statistics.searchWindow.end}`, { align: 'center' });
    doc.moveDown(0.8);

    // Line separator
    doc.strokeColor('#000000').lineWidth(0.5);
    doc.moveTo(35, doc.y).lineTo(doc.page.width - 35, doc.y).stroke();
    doc.moveDown(0.8);

    // SUMMARY STATS (simple text format, no colors)
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000').text('Summary Statistics');
    doc.fontSize(9).font('Helvetica').fillColor('#333333');
    doc.text(`Total Flights: ${statistics.totalFlights}`);
    doc.text(`Cheapest Fare: $${statistics.cheapestFare.toFixed(2)}`);
    doc.text(`Average Fare: $${statistics.averageFare.toFixed(2)}`);
    doc.text(`Most Expensive: $${statistics.mostExpensiveFare.toFixed(2)}`);
    doc.moveDown(0.8);

    // Line separator
    doc.strokeColor('#000000').lineWidth(0.5);
    doc.moveTo(35, doc.y).lineTo(doc.page.width - 35, doc.y).stroke();
    doc.moveDown(0.6);

    // COMPLETE FLIGHT LIST
    doc.fontSize(11).font('Helvetica-Bold').fillColor('#000000').text('Complete Flight List');
    doc.moveDown(0.4);

    // Group flights by date
    const groupedByDate = new Map<string, AggregatedFlight[]>();
    allFlights.forEach((flight) => {
      if (!groupedByDate.has(flight.date)) {
        groupedByDate.set(flight.date, []);
      }
      groupedByDate.get(flight.date)!.push(flight);
    });

    const sortedDates = Array.from(groupedByDate.keys()).sort();

    sortedDates.forEach((date) => {
      const flights = groupedByDate.get(date)!;
      const sortedFlights = flights.sort((a, b) => a.price - b.price);
      const top3PerDay = sortedFlights.slice(0, 3);

      // Format date: 2026-06-09 → 9 June 2026
      const dateObj = new Date(date + 'T00:00:00Z');
      const formattedDate = dateObj.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' });
      const lowestPrice = sortedFlights[0]?.price || 0;

      // Date header with cheapest price - positioned at left margin
      doc.moveDown(0.3);
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#000000')
        .text(formattedDate + ` - Lowest: $${lowestPrice.toFixed(2)}`, 35, doc.y);
      doc.moveDown(0.4);

      const col1 = 35;
      const col2 = 110;
      const col3 = 185;
      const col4 = 260;
      const col5 = 335;
      const col6 = 410;

      // Table rows - Top 3 for this day first (with rank marker)
      sortedFlights.forEach((flight, idx) => {
        const rowY = doc.y;
        const isTop3 = idx < 3;
        const rankMarker = isTop3 ? `#${idx + 1}` : '';

        doc.fontSize(7).font(isTop3 ? 'Helvetica-Bold' : 'Helvetica')
          .fillColor(isTop3 ? '#228B22' : '#333333');
        doc.text(rankMarker, col1, rowY, { width: 30 });
        doc.text(flight.airline, col1 + 30, rowY, { width: 50 });
        doc.text(flight.departureTime, col2, rowY, { width: 70 });
        doc.text(flight.arrivalTime, col3, rowY, { width: 70 });
        doc.text(`${flight.duration}m`, col4, rowY, { width: 70 });
        doc.text(flight.stops === 0 ? 'Non-stop' : flight.stops.toString(), col5, rowY, { width: 70 });
        doc.font(isTop3 ? 'Helvetica-Bold' : 'Helvetica')
          .fillColor(isTop3 ? '#228B22' : '#000000');
        doc.text(`$${flight.price.toFixed(2)}`, col6, rowY, { width: 40, align: 'right' });

        doc.moveDown(0.6);

        // Check if we need a new page
        if (doc.y > doc.page.height - 40) {
          doc.addPage();
        }
      });

      doc.moveDown(0.3);
    });

    // Footer will be added by pdfkit automatically
  }
}

export const pdfGenerationService = new PDFGenerationService();

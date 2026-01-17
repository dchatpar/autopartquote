import puppeteer from 'puppeteer';
import { QuoteItem } from '@/lib/store';
import { formatCurrency } from '@/lib/parser';


interface PDFGenerationOptions {
  items: QuoteItem[];
  referenceNumber: string;
  customerName: string;
  customerEmail?: string;
  subtotal: number;
  vatRate: number;
  vatAmount: number;
  grandTotal: number;
  currency: string;
}

/**
 * Generate enterprise-grade PDF for Dakshin Trading quote
 */
export async function generateQuotePDF(options: PDFGenerationOptions): Promise<Buffer> {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();

    // Set page size to A4
    await page.setViewport({ width: 794, height: 1123 }); // A4 in pixels at 96 DPI

    // Generate HTML content
    const html = generatePDFHTML(options);

    // Load HTML
    await page.setContent(html, { waitUntil: 'networkidle0' });

    // Generate PDF
    const pdf = await page.pdf({
      format: 'A4',
      printBackground: true,
      margin: {
        top: '15mm',
        right: '15mm',
        bottom: '15mm',
        left: '15mm',
      },
    });

    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}

/**
 * Generate HTML template for PDF
 */
function generatePDFHTML(options: PDFGenerationOptions): string {
  const {
    items,
    referenceNumber,
    customerName,
    customerEmail,
    subtotal,
    vatRate,
    vatAmount,
    grandTotal,
    currency,
  } = options;

  const date = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  // Group items by category for better organization
  const groupedItems = groupItemsByCategory(items);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page {
      size: A4;
      margin: 15mm;
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      font-size: 9pt;
      line-height: 1.4;
      color: #1a1a1a;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 30px;
      padding-bottom: 20px;
      border-bottom: 2px solid #0056b3;
    }

    .logo-section {
      flex: 1;
    }

    .company-name {
      font-size: 24pt;
      font-weight: 700;
      color: #0056b3;
      margin-bottom: 5px;
    }

    .company-tagline {
      font-size: 9pt;
      color: #666;
      margin-bottom: 10px;
    }

    .company-details {
      font-size: 8pt;
      color: #666;
      line-height: 1.6;
    }

    .document-info {
      text-align: right;
    }

    .document-title {
      font-size: 18pt;
      font-weight: 700;
      color: #1a1a1a;
      margin-bottom: 10px;
    }

    .reference-number {
      font-size: 11pt;
      font-weight: 600;
      color: #0056b3;
      font-family: 'Courier New', monospace;
      margin-bottom: 5px;
    }

    .date {
      font-size: 9pt;
      color: #666;
    }

    .customer-section {
      background: #f8f9fa;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 25px;
    }

    .customer-label {
      font-size: 8pt;
      text-transform: uppercase;
      color: #666;
      font-weight: 600;
      margin-bottom: 5px;
    }

    .customer-name {
      font-size: 12pt;
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 3px;
    }

    .customer-email {
      font-size: 9pt;
      color: #666;
    }

    .category-section {
      margin-bottom: 20px;
      page-break-inside: avoid;
    }

    .category-header {
      background: #0056b3;
      color: white;
      padding: 8px 12px;
      font-size: 10pt;
      font-weight: 600;
      margin-bottom: 10px;
      border-radius: 3px;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 15px;
    }

    thead {
      background: #f8f9fa;
    }

    th {
      padding: 8px 6px;
      text-align: left;
      font-size: 8pt;
      font-weight: 600;
      text-transform: uppercase;
      color: #666;
      border-bottom: 2px solid #dee2e6;
    }

    th.text-right {
      text-align: right;
    }

    td {
      padding: 10px 6px;
      border-bottom: 1px solid #e9ecef;
      vertical-align: middle;
    }

    td.text-right {
      text-align: right;
    }

    .part-image {
      width: 35px;
      height: 35px;
      object-fit: contain;
      border: 1px solid #e9ecef;
      border-radius: 3px;
      background: white;
    }

    .part-number {
      font-family: 'Courier New', monospace;
      font-weight: 600;
      color: #0056b3;
      font-size: 9pt;
    }

    .brand-badge {
      display: inline-block;
      padding: 2px 6px;
      background: #e3f2fd;
      color: #0056b3;
      border-radius: 3px;
      font-size: 7pt;
      font-weight: 600;
      text-transform: uppercase;
    }

    .summary-section {
      margin-top: 30px;
      display: flex;
      justify-content: flex-end;
    }

    .summary-table {
      width: 300px;
    }

    .summary-table td {
      border: none;
      padding: 8px 12px;
    }

    .summary-label {
      font-weight: 600;
      color: #666;
    }

    .summary-value {
      text-align: right;
      font-weight: 600;
    }

    .grand-total-row {
      background: #0056b3;
      color: white;
      font-size: 11pt;
    }

    .grand-total-row td {
      padding: 12px;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 1px solid #dee2e6;
      font-size: 8pt;
      color: #666;
      text-align: center;
    }

    .terms {
      margin-top: 30px;
      padding: 15px;
      background: #f8f9fa;
      border-left: 3px solid #0056b3;
      font-size: 8pt;
      color: #666;
      line-height: 1.6;
    }

    .terms-title {
      font-weight: 600;
      color: #1a1a1a;
      margin-bottom: 8px;
    }

    @media print {
      .page-break {
        page-break-before: always;
      }
    }
  </style>
</head>
<body>
  <!-- Header -->
  <div class="header">
    <div class="logo-section">
      <div class="company-name">DAKSHIN TRADING</div>
      <div class="company-tagline">Enterprise Quoting Engine</div>
      <div class="company-details">
        Genuine Auto Spare Parts & Lubricants<br>
        Dubai, UAE | KSA | Africa | UK | India<br>
        support@dakshintrading.com
      </div>
    </div>
    <div class="document-info">
      <div class="document-title">PRO-FORMA INVOICE</div>
      <div class="reference-number">${referenceNumber}</div>
      <div class="date">${date}</div>
    </div>
  </div>

  <!-- Customer Info -->
  <div class="customer-section">
    <div class="customer-label">Bill To</div>
    <div class="customer-name">${customerName}</div>
    ${customerEmail ? `<div class="customer-email">${customerEmail}</div>` : ''}
  </div>

  <!-- Items by Category -->
  ${Object.entries(groupedItems).map(([category, categoryItems]) => `
    <div class="category-section">
      <div class="category-header">${category} (${categoryItems.length} items)</div>
      <table>
        <thead>
          <tr>
            <th style="width: 40px;">SR#</th>
            <th style="width: 45px;">Image</th>
            <th style="width: 100px;">Part Number</th>
            <th>Description</th>
            <th style="width: 70px;">Brand</th>
            <th class="text-right" style="width: 50px;">Qty</th>
            <th class="text-right" style="width: 80px;">Unit Price</th>
            <th class="text-right" style="width: 90px;">Total</th>
          </tr>
        </thead>
        <tbody>
          ${categoryItems.map((item, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>
                ${item.imageUrl
      ? `<img src="${item.imageUrl}" class="part-image" style="max-width: 35px; max-height: 35px;" />`
      : '<div class="part-image"></div>'
    }
              </td>
              <td class="part-number">${item.partNumber}</td>
              <td>${item.description}</td>
              <td>${item.brand ? `<span class="brand-badge">${item.brand}</span>` : '-'}</td>
              <td class="text-right">${item.quantity}</td>
              <td class="text-right">${formatCurrency(item.unitPrice, currency)}</td>
              <td class="text-right">${formatCurrency(item.total, currency)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `).join('')}

  <!-- Summary -->
  <div class="summary-section">
    <table class="summary-table">
      <tr>
        <td class="summary-label">Subtotal (Excl. VAT)</td>
        <td class="summary-value">${formatCurrency(subtotal, currency)}</td>
      </tr>
      <tr>
        <td class="summary-label">VAT (${(vatRate * 100).toFixed(0)}%)</td>
        <td class="summary-value">${formatCurrency(vatAmount, currency)}</td>
      </tr>
      <tr class="grand-total-row">
        <td>GRAND TOTAL</td>
        <td class="text-right">${formatCurrency(grandTotal, currency)}</td>
      </tr>
    </table>
  </div>

  <!-- Terms & Conditions -->
  <div class="terms">
    <div class="terms-title">Terms & Conditions</div>
    <ul style="margin-left: 15px; margin-top: 5px;">
      <li>All parts are genuine OEM quality</li>
      <li>Prices are subject to change without notice</li>
      <li>Payment terms: As per agreement</li>
      <li>Delivery: As per customer requirements</li>
    </ul>
  </div>

  <!-- Footer -->
  <div class="footer">
    This is a computer-generated document. For queries, contact support@dakshintrading.com<br>
    Generated on ${new Date().toLocaleString('en-US')}
  </div>
</body>
</html>
  `;
}

/**
 * Group items by category for organized PDF layout
 */
function groupItemsByCategory(items: QuoteItem[]): Record<string, QuoteItem[]> {
  const grouped: Record<string, QuoteItem[]> = {};

  items.forEach(item => {
    const category = item.category || 'Other';
    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(item);
  });

  return grouped;
}

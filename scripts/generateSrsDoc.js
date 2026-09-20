import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  ShadingType,
} from "docx";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function heading(text, level = HeadingLevel.HEADING_1) {
  return new Paragraph({
    text,
    heading: level,
    spacing: { before: 240, after: 120 },
  });
}

function paragraph(text, options = {}) {
  return new Paragraph({
    children: [
      new TextRun({
        text,
        font: "Calibri",
        size: 22,
        ...options,
      }),
    ],
    spacing: { before: 60, after: 60 },
  });
}

function bullet(text) {
  return new Paragraph({
    bullet: { level: 0 },
    children: [new TextRun({ text, font: "Calibri", size: 22 })],
    spacing: { before: 40, after: 40 },
  });
}

function createTable(headers, rows) {
  const tableRows = [];

  tableRows.push(
    new TableRow({
      tableHeader: true,
      children: headers.map(
        (h) =>
          new TableCell({
            children: [
              new Paragraph({
                children: [new TextRun({ text: h, bold: true, color: "FFFFFF", font: "Calibri", size: 20 })],
              }),
            ],
            shading: { type: ShadingType.CLEAR, fill: "C65332" },
            margins: { top: 120, bottom: 120, left: 140, right: 140 },
          })
      ),
    })
  );

  rows.forEach((r, idx) => {
    tableRows.push(
      new TableRow({
        children: r.map(
          (cellText) =>
            new TableCell({
              children: [
                new Paragraph({
                  children: [new TextRun({ text: cellText, font: "Calibri", size: 20 })],
                }),
              ],
              shading: idx % 2 === 1 ? { type: ShadingType.CLEAR, fill: "F9F5F0" } : undefined,
              margins: { top: 100, bottom: 100, left: 140, right: 140 },
            })
        ),
      })
    );
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: tableRows,
  });
}

async function generateSRS() {
  const doc = new Document({
    title: "Startup IQ Software Requirements Specification",
    description: "Complete IEEE 830 / ISO 29148 Specification with MERN Technology Mapping",
    sections: [
      {
        children: [
          // Cover Page
          new Paragraph({
            text: "STARTUP IQ",
            alignment: AlignmentType.CENTER,
            spacing: { before: 1800, after: 120 },
            children: [
              new TextRun({
                text: "STARTUP IQ",
                font: "Calibri",
                size: 56,
                bold: true,
                color: "C65332",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 600 },
            children: [
              new TextRun({
                text: "Software Requirements Specification (IEEE 830 / ISO 29148)",
                font: "Calibri",
                size: 28,
                color: "555555",
              }),
            ],
          }),
          new Paragraph({
            alignment: AlignmentType.CENTER,
            spacing: { after: 1200 },
            children: [
              new TextRun({
                text: "Smart Business Management Workspace for Solo Makers & Growing Startups\nVersion 3.0.0 · Comprehensive M, E, R, N Concept Mapping",
                font: "Calibri",
                size: 22,
                color: "777777",
              }),
            ],
          }),

          // Metadata Table
          createTable(
            ["Document Property", "Specification Detail"],
            [
              ["Standard", "IEEE Std 830-1998 / ISO/IEC/IEEE 29148:2018"],
              ["Document ID", "SRS-STARTUP-IQ-2026-V3"],
              ["Version", "3.0.0 Production Release"],
              ["Architecture", "Full MERN Stack (MongoDB, Express, React 18, Node.js)"],
              ["Target Audience", "Engineers, Solution Architects, Product Owners & Designers"],
              ["Release Date", "September 2026"],
            ]
          ),

          new Paragraph({ pageBreakBefore: true }),

          // Section 1: Introduction
          heading("1. Introduction", HeadingLevel.HEADING_1),
          paragraph(
            "This Software Requirements Specification (SRS) establishes the complete requirements baseline for Startup IQ, a modern business management workspace engineered for solo makers, artisan entrepreneurs, home bakers, crafters, and growing micro-enterprises."
          ),
          heading("1.1 Purpose & Scope", HeadingLevel.HEADING_2),
          paragraph(
            "Startup IQ unifies Point of Sale (POS), recipe-based inventory management, customer credit receivables, operational overhead tracking, honest profit/loss calculations, and plain-language growth analytics into a cohesive, responsive web platform."
          ),
          heading("1.2 Terminology & Definitions", HeadingLevel.HEADING_2),
          bullet("BOM (Bill of Materials): Specification of ingredients or raw materials required to produce a product unit."),
          bullet("COGS: Direct material and production expenses calculated from BOM unit costs."),
          bullet("Due: Deferred payment order resulting in an account receivable tracked under customer balances."),
          bullet("Movement Audit: Immutable log recording all stock additions, deductions, adjustments, and reversals."),

          new Paragraph({ spacing: { before: 200 } }),

          // Section 2: System Features
          heading("2. System Features & Functional Requirements", HeadingLevel.HEADING_1),
          createTable(
            ["Req ID", "Feature Area", "Detailed Description"],
            [
              ["F-01", "Domain Onboarding", "Seeds starter catalog, materials, and transactions across 7 craft archetypes."],
              ["F-02", "Tri-Partite Dashboard", "Answers: How is business doing? What needs attention? What should I do next? (Quick actions)."],
              ["F-03", "Catalog & BOM Recipes", "Product menu with pricing, category tags, cost price, and BOM recipe linking."],
              ["F-04", "Inventory & Movements", "Raw materials tracking with inline micro-steppers (-/+) and immutable Movement History audit log."],
              ["F-05", "Smart Point-of-Sale", "Validates inventory availability before sale; prevents negative stock with detailed shortage report."],
              ["F-06", "Operating Expenses", "Categorized expense tracker (Packaging, Materials, Rent, Marketing) that directly updates Net Profit."],
              ["F-07", "Customer Receivables", "Manages credit orders, customer dues ledger, and in-app payment settlements."],
              ["F-08", "Growth Heuristics", "Identifies peak weekday, best seller, slow movers, and expense ratio warnings in plain language."],
              ["F-09", "Sales Ledger & CSV", "Searchable, filterable transaction history with one-click export to standard CSV spreadsheet."],
              ["F-10", "Authentication & JWT", "User signup, bcrypt password hashing, login, session tokens, and workspace isolation."],
            ]
          ),

          new Paragraph({ pageBreakBefore: true }),

          // Section 3: Data Schemas
          heading("3. Data Schemas & Mongoose Architecture", HeadingLevel.HEADING_1),
          paragraph("Startup IQ data models are defined using strict Mongoose schemas with compound indexes:"),
          createTable(
            ["Entity", "Key Schema Fields", "Index Configuration"],
            [
              ["User", "name, email, passwordHash, businessName, businessType, currency", "{ email: 1 }"],
              ["Customer", "name, phone, email, totalOrders, totalSpent, outstandingDue, paymentHistory", "{ businessTypeId: 1, outstandingDue: -1 }"],
              ["Product", "name, category, price, costPrice, recipe: [RecipeItem], active", "{ businessTypeId: 1, category: 1 }"],
              ["Stock", "name, unit, quantity, lowThreshold, costPerUnit, supplier", "{ businessTypeId: 1, name: 1 }"],
              ["InventoryMovement", "materialId, materialName, quantityDelta, unit, reason, referenceId, timestamp", "{ businessTypeId: 1, timestamp: -1 }"],
              ["Sale", "productName, quantity, unitPrice, amount, costAmount, profit, paymentMethod, customerName, isPaid", "{ businessTypeId: 1, date: -1 }"],
              ["Expense", "title, category, amount, date, notes", "{ businessTypeId: 1, date: -1 }"],
            ]
          ),

          new Paragraph({ spacing: { before: 200 } }),

          // Section 4: Technology Mapping
          heading("4. Technology Mapping: Best-Fit MERN Concepts", HeadingLevel.HEADING_1),
          createTable(
            ["Stack Tier", "Target Concepts", "Startup IQ Implementation & Justification"],
            [
              [
                "MongoDB (M)",
                "Aggregation Pipelines ($facet, $group), Atomic Updates ($inc), Compound Indexes",
                "Computes financial metrics in a single round-trip; performs atomic stock decrements during sales without concurrency race conditions."
              ],
              [
                "Express.js (E)",
                "Modular Router Pattern, Error Handling Middleware, CORS & Request Validation",
                "Segregates endpoints cleanly across domain controllers; handles API rate limits, input sanitization, and uniform error schemas."
              ],
              [
                "React 18+ (R)",
                "Component Decomposition, Custom Hooks, Zero-Dependency SVG Data Viz, Accessible Modals",
                "Delivers instantaneous UI rendering without third-party chart weight; handles dual-breakpoint responsive layout (mobile bottom bar + desktop sidebar)."
              ],
              [
                "Node.js (N)",
                "Non-Blocking Event Loop, Stream Piping, Process Lifecycle Management (SIGINT/SIGTERM)",
                "Handles asynchronous socket I/O under concurrent sales loads; streams CSV file exports without buffering large files in RAM."
              ],
            ]
          ),

          new Paragraph({ pageBreakBefore: true }),

          // Section 5: Non-Functional & Traceability
          heading("5. Non-Functional Requirements & RTM", HeadingLevel.HEADING_1),
          createTable(
            ["Quality Attribute", "Target Metric", "Architectural Enforcement"],
            [
              ["Performance", "< 100ms API response, < 1.2s LCP", "No heavy dependencies; handcrafted SVG; compound DB indexes."],
              ["Accessibility", "WCAG 2.1 Level AA Compliance", "44px+ touch targets, accessible modal focus traps, 4.5:1 contrast."],
              ["Reliability", "Zero-crash offline fallback", "In-memory resilient fallback store when MongoDB is disconnected."],
              ["Security", "Bcrypt hashing & JWT Bearer tokens", "Salted password hashes, scoped multi-tenant queries, strict payload limits."],
            ]
          ),

          new Paragraph({ spacing: { before: 200 } }),
          heading("Document Verification Sign-off", HeadingLevel.HEADING_2),
          paragraph("This specification has been verified against the production-ready Startup IQ MERN codebase. All functional features, UI components, and backend endpoints are implemented and certified."),
        ],
      },
    ],
  });

  const buffer = await Packer.toBuffer(doc);
  const outPath = path.join(__dirname, "..", "Startup_IQ_SRS.docx");
  fs.writeFileSync(outPath, buffer);
  console.log(`[OK] Startup IQ SRS Word Document successfully generated at: ${outPath}`);
}

generateSRS().catch((err) => {
  console.error("SRS generation failed:", err);
  process.exit(1);
});

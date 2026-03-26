import jsPDF from "jspdf";
import { BudgetBreakdown } from "./budgetEngine";

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function generatePDF(data: any, budget: BudgetBreakdown | null, fileName: string) {
  const doc = new jsPDF();
  const gold = [200, 169, 81] as const;
  const navy = [27, 42, 74] as const;
  let y = 20;

  // Header
  doc.setFillColor(...navy);
  doc.rect(0, 0, 210, 40, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont("helvetica", "bold");
  doc.text("Southern Cities Enterprises", 15, 22);
  doc.setFontSize(12);
  doc.setFont("helvetica", "normal");
  doc.text("Project Intake — Proposal Summary", 15, 32);
  y = 50;

  // Reference
  doc.setTextColor(...navy);
  doc.setFontSize(10);
  doc.text(`Reference: SCE-${Date.now().toString(36).toUpperCase()}`, 15, y);
  doc.text(`Date: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, 120, y);
  y += 12;

  // Section helper
  const section = (title: string) => {
    doc.setFillColor(...gold);
    doc.rect(15, y - 4, 180, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text(title, 18, y + 1);
    y += 12;
    doc.setTextColor(60, 60, 60);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
  };

  const row = (label: string, value: string) => {
    doc.setFont("helvetica", "bold");
    doc.text(label, 18, y);
    doc.setFont("helvetica", "normal");
    doc.text(value, 80, y);
    y += 7;
  };

  // Client Info
  section("Client Information");
  row("Name:", `${data.firstName} ${data.lastName}`);
  row("Email:", data.email);
  row("Phone:", data.phone);
  row("TIN/EIN:", data.tinEin);
  row("Articles:", fileName || "Uploaded");
  y += 5;

  // Project Info
  section("Project Details");
  row("Address:", data.propertyAddress);
  row("City/State/ZIP:", `${data.city || ""}, ${data.state || ""} ${data.zipCode || ""}`);

  row("Square Footage:", `${parseInt(data.squareFootage).toLocaleString()} SF`);
  row("Project Type:", data.projectType);
  row("Occupancy:", data.occupancyType);
  row("Units:", data.numberOfUnits);
  y += 5;

  // Scope
  section("Scope of Work");
  const scopeLines = doc.splitTextToSize(data.scopeOfWork, 170);
  doc.text(scopeLines, 18, y);
  y += scopeLines.length * 5 + 5;

  if (data.startDate) row("Start Date:", data.startDate);
  if (data.completionDate) row("Completion:", data.completionDate);
  y += 5;

  // Budget
  if (budget) {
    if (y > 220) { doc.addPage(); y = 20; }
    section("Budget Estimate");
    budget.lineItems.forEach((item) => {
      const label = item.label.startsWith("  →") ? item.label : item.label;
      doc.text(label, 18, y);
      doc.text(fmt(item.amount), 160, y, { align: "right" });
      y += 7;
    });
    y += 3;
    doc.setDrawColor(...gold);
    doc.line(18, y - 2, 190, y - 2);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(...navy);
    doc.text("TOTAL ESTIMATE", 18, y + 4);
    doc.text(fmt(budget.total), 190, y + 4, { align: "right" });
    y += 15;

    if (data.estimatedCost) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 100, 100);
      doc.text(`Client's Estimate: ${data.estimatedCost}`, 18, y);
      y += 10;
    }
  }

  // Footer
  const pageHeight = doc.internal.pageSize.height;
  doc.setFillColor(...navy);
  doc.rect(0, pageHeight - 20, 210, 20, "F");
  doc.setTextColor(150, 150, 150);
  doc.setFontSize(8);
  doc.text("This is an estimate only. Final pricing subject to detailed review. © Southern Cities Enterprises", 105, pageHeight - 8, { align: "center" });

  doc.save(`SCE-Proposal-${data.lastName}-${Date.now()}.pdf`);
}

import ExcelJS from "exceljs";
import PDFDocument from "pdfkit";
import { Prisma } from "@prisma/client";
import type { Request, Response } from "express";
import { prisma } from "../../config/database.js";
import { AppError } from "../../utils/AppError.js";
import type { MonthlyExportQuery, TransactionExportQuery, YearlyExportQuery } from "./exports.schemas.js";

function owner(req: Request): string {
  if (!req.auth) throw new AppError(401, "UNAUTHORIZED", "Authentication token is required");
  return req.auth.userId;
}

function csvCell(value: unknown): string {
  const text = value instanceof Date ? value.toISOString() : String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function period(year: number, month?: number): { from: Date; to: Date } {
  return month
    ? { from: new Date(Date.UTC(year, month - 1, 1)), to: new Date(Date.UTC(year, month, 1)) }
    : { from: new Date(Date.UTC(year, 0, 1)), to: new Date(Date.UTC(year + 1, 0, 1)) };
}

async function transactions(userId: string, from?: Date, to?: Date) {
  return prisma.transaction.findMany({
    where: {
      userId,
      ...(from || to ? { transactionDate: { ...(from ? { gte: from } : {}), ...(to ? { lte: to } : {}) } } : {}),
    },
    include: { category: { select: { name: true } }, subcategory: { select: { name: true } } },
    orderBy: { transactionDate: "asc" },
  });
}

async function summary(userId: string, from: Date, to: Date) {
  const [income, entries] = await prisma.$transaction([
    prisma.incomeTransaction.aggregate({ where: { userId, receivedDate: { gte: from, lt: to } }, _sum: { amount: true } }),
    prisma.transaction.findMany({ where: { userId, transactionDate: { gte: from, lt: to } }, select: { amount: true, transactionType: true } }),
  ]);

  let expenses = new Prisma.Decimal(0);
  let savings = new Prisma.Decimal(0);
  let investments = new Prisma.Decimal(0);

  for (const entry of entries) {
    if (entry.transactionType === "EXPENSE" || entry.transactionType === "LOAN_PAYMENT") {
      expenses = expenses.add(entry.amount);
    }
    if (entry.transactionType === "SAVING") savings = savings.add(entry.amount);
    if (entry.transactionType === "INVESTMENT") investments = investments.add(entry.amount);
  }

  return {
    income: income._sum.amount?.toFixed(2) ?? "0.00",
    expenses: expenses.toFixed(2),
    savings: savings.toFixed(2),
    investments: investments.toFixed(2),
  };
}

export async function exportTransactions(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as TransactionExportQuery;
  const rows = await transactions(owner(req), query.from, query.to);
  const headers = ["id", "transactionType", "amount", "category", "subcategory", "accountId", "transactionDate", "paymentMethod", "description", "notes"];
  const values = rows.map((row) => [row.id, row.transactionType, row.amount.toFixed(2), row.category?.name, row.subcategory?.name, row.accountId, row.transactionDate, row.paymentMethod, row.description, row.notes]);
  if (query.format === "CSV") {
    res.type("text/csv").attachment("transactions.csv").send([headers, ...values].map((row) => row.map(csvCell).join(",")).join("\n"));
    return;
  }
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet("Transactions");
  sheet.addRow(headers);
  values.forEach((row) => sheet.addRow(row));
  sheet.getRow(1).font = { bold: true };
  res.type("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet").attachment("transactions.xlsx");
  await workbook.xlsx.write(res);
  res.end();
}

async function exportReport(res: Response, title: string, values: { income: string; expenses: string; savings: string; investments: string }): Promise<void> {
  const document = new PDFDocument();
  res.type("application/pdf").attachment(`${title.toLowerCase().replace(/\s+/g, "-")}.pdf`);
  document.pipe(res);
  document.fontSize(20).text(title).moveDown();
  document.fontSize(12).text(`Income: ${values.income}`).text(`Expenses: ${values.expenses}`).text(`Savings: ${values.savings}`).text(`Investments: ${values.investments}`);
  document.end();
}

export async function exportMonthlyReport(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as MonthlyExportQuery;
  const dates = period(query.year, query.month);
  await exportReport(res, `Monthly Report ${query.year}-${String(query.month).padStart(2, "0")}`, await summary(owner(req), dates.from, dates.to));
}

export async function exportYearlyReport(req: Request, res: Response): Promise<void> {
  const query = req.query as unknown as YearlyExportQuery;
  const dates = period(query.year);
  await exportReport(res, `Yearly Report ${query.year}`, await summary(owner(req), dates.from, dates.to));
}
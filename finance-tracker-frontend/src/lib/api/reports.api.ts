import { apiGet } from "./client";
import type {
  ReportQueryParams,
  MonthlyReportData,
  YearlyReportData,
  NetWorthReportData,
  CategoryReportItem,
  CashFlowReportData,
} from "@/types/report";

export { type ReportQueryParams };

export const reportsApi = {
  getMonthlyReport: (params?: ReportQueryParams) =>
    apiGet<MonthlyReportData>("/reports/monthly", { params }),
  getYearlyReport: (params?: ReportQueryParams) =>
    apiGet<YearlyReportData>("/reports/yearly", { params }),
  getNetWorthReport: (params?: ReportQueryParams) =>
    apiGet<NetWorthReportData>("/reports/net-worth", { params }),
  getCategoryReport: (params?: ReportQueryParams) =>
    apiGet<CategoryReportItem[]>("/reports/category", { params }),
  getCashFlowReport: (params?: ReportQueryParams) =>
    apiGet<CashFlowReportData>("/reports/cash-flow", { params }),
};

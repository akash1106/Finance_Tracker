import { apiGet } from "./client";

export interface ReportQueryParams {
  year?: number;
  month?: number;
  startDate?: string;
  endDate?: string;
}

export const reportsApi = {
  getMonthlyReport: (params?: ReportQueryParams) =>
    apiGet<unknown>("/reports/monthly", { params }),
  getYearlyReport: (params?: ReportQueryParams) =>
    apiGet<unknown>("/reports/yearly", { params }),
  getNetWorthReport: (params?: ReportQueryParams) =>
    apiGet<unknown>("/reports/net-worth", { params }),
  getCategoryReport: (params?: ReportQueryParams) =>
    apiGet<unknown>("/reports/category", { params }),
  getCashFlowReport: (params?: ReportQueryParams) =>
    apiGet<unknown>("/reports/cash-flow", { params }),
};

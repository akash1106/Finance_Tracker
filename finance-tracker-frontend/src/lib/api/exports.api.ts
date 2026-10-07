import { apiClient } from "./client";
import { getStoredToken } from "@/features/auth/auth.utils";

export interface TransactionExportParams {
  format: "CSV" | "XLSX";
  from?: string;
  to?: string;
}

export interface MonthlyExportParams {
  year: number;
  month: number;
}

export interface YearlyExportParams {
  year: number;
}

export async function downloadFile(
  url: string,
  defaultFilename: string,
  params?: Record<string, unknown>
): Promise<void> {
  const token = typeof window !== "undefined" ? getStoredToken() : null;
  const response = await apiClient.get(url, {
    params,
    responseType: "blob",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  let filename = defaultFilename;
  const disposition = response.headers["content-disposition"];
  if (disposition && disposition.indexOf("attachment") !== -1) {
    const filenameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
    const matches = filenameRegex.exec(disposition);
    if (matches != null && matches[1]) {
      filename = matches[1].replace(/['"]/g, "");
    }
  }

  const blob = new Blob([response.data], {
    type: String(response.headers["content-type"] || "application/octet-stream"),
  });
  const downloadUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = downloadUrl;
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(downloadUrl);
}

export const exportsApi = {
  downloadTransactions: (params: TransactionExportParams) =>
    downloadFile(
      "/exports/transactions",
      `transactions.${params.format.toLowerCase()}`,
      params as unknown as Record<string, unknown>
    ),
  downloadMonthlyReport: (params: MonthlyExportParams) =>
    downloadFile(
      "/exports/monthly-report",
      `monthly-report-${params.year}-${String(params.month).padStart(2, "0")}.pdf`,
      params as unknown as Record<string, unknown>
    ),
  downloadYearlyReport: (params: YearlyExportParams) =>
    downloadFile(
      "/exports/yearly-report",
      `yearly-report-${params.year}.pdf`,
      params as unknown as Record<string, unknown>
    ),
};

import { NextRequest } from "next/server";
import { limitsFor } from "@/server/db";
import { requireUser } from "@/server/auth";
import { HttpError, route } from "@/server/http";
import { listBoard } from "@/server/ideas";

function csvCell(value: string) {
  if (/[",\n]/.test(value)) return `"${value.replace(/"/g, '""')}"`;
  return value;
}

export const GET = route(async (req: NextRequest) => {
  const user = requireUser(req);
  const format = req.nextUrl.searchParams.get("format") || "csv";
  const allowed = limitsFor(user.plan).export;
  if (!allowed.includes(format as "csv")) {
    throw new HttpError(402, "Exports start on the Creator plan. CSV opens in Google Sheets.", "PLAN_LIMIT");
  }
  const items = listBoard(user.id);
  if (format === "json") {
    return new Response(JSON.stringify({ ideas: items }, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": "attachment; filename=trendpulse-ideas.json",
      },
    });
  }
  if (format === "notion") {
    const header = "| Trend | Format | Status | Hook | Notes |";
    const line = "| --- | --- | --- | --- | --- |";
    const rows = items.map((item) => `| ${cell(item.trend_name || "")} | ${cell(item.format)} | ${cell(item.status)} | ${cell(item.hook)} | ${cell(item.notes)} |`);
    const markdown = [header, line, ...rows].join("\n");
    return new Response(markdown, {
      headers: {
        "Content-Type": "text/markdown; charset=utf-8",
        "Content-Disposition": "attachment; filename=trendpulse-notion.md",
      },
    });
  }
  const header = ["trend", "platform", "format", "status", "hook", "outline", "notes", "created_at"];
  const lines = items.map((item) =>
    [item.trend_name || "", item.platform, item.format, item.status, item.hook, item.outline, item.notes, item.created_at].map(csvCell).join(","),
  );
  const csv = `\uFEFF${[header.join(","), ...lines].join("\n")}`;
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": "attachment; filename=trendpulse-ideas.csv",
    },
  });
});

function cell(value: string) {
  return value.replace(/\|/g, "/").replace(/\n/g, " ");
}

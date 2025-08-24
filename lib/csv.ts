import { Attempt } from "@/types";

export function attemptsToCsv(rows: Attempt[]) {
  const header = ["participantName", "nij", "score", "submittedAt"];
  const body = rows.map(r => [r.participantName, r.nij, String(r.score), r.submittedAt]);
  return [header, ...body].map(cols =>
    cols.map(v => `"${String(v).replace(/"/g, '""')}"`).join(",")
  ).join("\n");
}

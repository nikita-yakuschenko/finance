import * as XLSX from "xlsx";
import fs from "fs";

const wb = XLSX.read(fs.readFileSync("C:/finance/data/ДДС.xlsx"), { type: "buffer" });
const s = wb.Sheets["БДДС"];
for (let c = 1; c <= 80; c++) {
  const L = XLSX.utils.encode_col(c - 1);
  const m = s[`${L}8`]?.v;
  const w = s[`${L}9`]?.v;
  const h = s[`${L}10`]?.v;
  if (m || (w && String(w).includes("Итого")) || h === "План" || h === "Факт") {
    if (m || String(w || "").includes("Итого")) console.log(L, "month:", m, "week:", w, "hdr:", h);
  }
}

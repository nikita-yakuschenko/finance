import * as XLSX from "xlsx";
import fs from "fs";

const wb = XLSX.read(fs.readFileSync("C:/finance/data/ДДС.xlsx"), { type: "buffer" });
const s = wb.Sheets["Основные данные за месяц"];

// snapshot headers row 3
for (const col of ["A","E","I","M","Q","U","Y"]) {
  console.log(col+"3:", s[col+"3"]?.v, "val", s[col.replace("A","C").replace("E","G").replace("I","K").replace("M","O").replace("Q","S").replace("U","W").replace("Y","AA")+"3"]?.v);
}

console.log("\n--- Orgs row 8-15 ---");
for (let r=8;r<=15;r++) {
  const cols = ["C","G","K","O","S","W","AA"].map(c=>s[c+r]?.v);
  if (s["A"+r]?.v) console.log(r, s["A"+r]?.v, cols);
}

console.log("\n--- Credit 18-23 ---");
for (let r=18;r<=23;r++) console.log(r, s["A"+r]?.v, s["C"+r]?.v);

console.log("\n--- Accum CF 25-41 ---");
for (let r=25;r<=41;r++) if (s["A"+r]?.v || s["C"+r]?.v) console.log(r, s["A"+r]?.v, s["C"+r]?.v, s["I"+r]?.v);

console.log("\n--- Warehouses 43-78 ---");
let wh=0;
for (let r=43;r<=78;r++) if (s["A"+r]?.v) { wh++; if (wh<=5 || wh>28) console.log(r, s["A"+r]?.v, s["C"+r]?.v); }

console.log("\n--- P&L AC-AE ---");
for (let r=3;r<=20;r++) if (s["AC"+r]?.v) console.log(r, s["AC"+r]?.v, s["AD"+r]?.v, s["AE"+r]?.v);

console.log("\n--- Mgmt AG-AJ ---");
for (let r=3;r<=15;r++) if (s["AG"+r]?.v || s["AI"+r]?.v) console.log(r, s["AG"+r]?.v, s["AH"+r]?.v, s["AI"+r]?.v, s["AJ"+r]?.v);

const cf = wb.Sheets["CF по неделям"];
console.log("\n--- CF weeks row 21 ---");
["B","C","D","E","F","G","H","K","L","M","N","O","P","Q"].forEach(c=>console.log(c+"21:", cf[c+"21"]?.v));

console.log("\n--- CF sample rows ---");
for (let r=24;r<=35;r++) {
  const a = cf["A"+r]?.v;
  if (!a) continue;
  const vals = ["B","C","D"].map(c=>cf[c+r]?.v);
  console.log(r, a, vals);
}

const bd = wb.Sheets["БДДС"];
console.log("\n--- BDDS rows with A ---");
let cnt=0;
for (let r=11;r<=120;r++) {
  const a = bd["A"+r]?.v;
  if (!a) continue;
  cnt++;
  const plan = bd["BJ"+r]?.v, fact = bd["BK"+r]?.v;
  if (cnt<=10 || plan || fact) console.log(r, String(a).slice(0,50), "plan", plan, "fact", fact);
}

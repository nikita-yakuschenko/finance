import fs from "fs";
import path from "path";

const root = process.cwd();
const dest = path.resolve(root, "data", "source.xlsx");

const source = fs
  .readdirSync(root)
  .find((f) => f.toLowerCase().endsWith(".xlsx") && f.includes("ДДС"));

if (!source) {
  console.error("Не найден ДДС.xlsx в", root);
  process.exit(1);
}

fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.copyFileSync(path.join(root, source), dest);
console.log("Скопировано:", path.join(root, source), "→", dest);

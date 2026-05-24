import fs from "node:fs/promises";
import path from "node:path";
import { XMLParser } from "fast-xml-parser";

const rootDir = process.cwd();
const outputPath = path.join(rootDir, "data", "market", "latest.json");
const envPath = path.join(rootDir, ".env");

function collectApiAuthorization() {
  const key = String(process.env.COLLECTAPI_KEY || "").trim();
  if (!key) return "";
  return key.toLocaleLowerCase("en-US").startsWith("apikey ") ? key : `apikey ${key}`;
}

async function loadEnvFile() {
  try {
    const env = await fs.readFile(envPath, "utf8");
    for (const line of env.split(/\r?\n/u)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/u);
      if (!match || process.env[match[1]]) continue;
      process.env[match[1]] = match[2].replace(/^["']|["']$/gu, "");
    }
  } catch {
    // .env is optional.
  }
}

function numberFrom(value) {
  const parsed = Number(String(value || "").replace(",", "."));
  return Number.isFinite(parsed) ? parsed : null;
}

function marketItem({ code, name, value, previousValue, source }) {
  const change = previousValue && value ? ((value - previousValue) / previousValue) * 100 : null;

  return {
    code,
    name,
    value,
    previousValue,
    change,
    source,
  };
}

async function fetchCollectApi() {
  const authorization = collectApiAuthorization();
  if (!authorization) return null;

  const response = await fetch("https://api.collectapi.com/economy/allCurrency", {
    headers: {
      authorization,
      "content-type": "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`CollectAPI döviz verisi alınamadı: ${response.status}`);
  }

  const data = await response.json();
  const rows = Array.isArray(data.result) ? data.result : [];
  const wanted = new Map([
    ["USD", "Dolar"],
    ["EUR", "Euro"],
    ["GBP", "Sterlin"],
  ]);

  const items = rows
    .map((row) => {
      const code = String(row.code || row.currency || row.name || "").toUpperCase();
      const key = [...wanted.keys()].find((item) => code.includes(item));
      if (!key) return null;

      return marketItem({
        code: key,
        name: wanted.get(key),
        value: numberFrom(row.selling || row.buying || row.rate || row.value),
        previousValue: null,
        source: "CollectAPI",
      });
    })
    .filter((item) => item?.value);

  return items.length ? { source: "CollectAPI", items } : null;
}

async function fetchTcmb() {
  const response = await fetch("https://www.tcmb.gov.tr/kurlar/today.xml");
  if (!response.ok) {
    throw new Error(`TCMB döviz verisi alınamadı: ${response.status}`);
  }

  const xml = await response.text();
  const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: "" });
  const parsed = parser.parse(xml);
  const rows = parsed?.Tarih_Date?.Currency || [];
  const currencies = Array.isArray(rows) ? rows : [rows];
  const wanted = new Map([
    ["USD", "Dolar"],
    ["EUR", "Euro"],
    ["GBP", "Sterlin"],
  ]);

  const items = currencies
    .map((row) => {
      const code = row.CurrencyCode;
      if (!wanted.has(code)) return null;

      return marketItem({
        code,
        name: wanted.get(code),
        value: numberFrom(row.ForexSelling || row.BanknoteSelling || row.ForexBuying),
        previousValue: null,
        source: "TCMB",
      });
    })
    .filter(Boolean);

  return { source: "TCMB", items };
}

async function main() {
  await loadEnvFile();
  const market = (await fetchCollectApi()) || (await fetchTcmb());

  await fs.mkdir(path.dirname(outputPath), { recursive: true });
  await fs.writeFile(
    outputPath,
    `${JSON.stringify(
      {
        updatedAt: new Date().toISOString(),
        source: market.source,
        items: market.items,
      },
      null,
      2
    )}\n`,
    "utf8"
  );

  console.log(`Piyasa verisi güncellendi: ${market.source}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

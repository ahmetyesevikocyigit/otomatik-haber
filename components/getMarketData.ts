import fs from "fs";

export type MarketItem = {
  code: string;
  name: string;
  value: number;
  previousValue?: number | null;
  change?: number | null;
  source: string;
};

export type MarketData = {
  updatedAt: string;
  source: string;
  items: MarketItem[];
};

const fallbackMarket: MarketData = {
  updatedAt: "",
  source: "",
  items: [],
};

const getMarketData = (): MarketData => {
  try {
    const content = fs.readFileSync("data/market/latest.json", "utf8");
    const parsed = JSON.parse(content);

    return {
      updatedAt: parsed.updatedAt || "",
      source: parsed.source || "",
      items: Array.isArray(parsed.items) ? parsed.items : [],
    };
  } catch {
    return fallbackMarket;
  }
};

export default getMarketData;

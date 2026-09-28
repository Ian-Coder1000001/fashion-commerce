import { unstable_cache } from "next/cache";
import { connectToDatabase } from "@/lib/db";
import StoreSettings from "@/models/StoreSettings";

const DEFAULTS = {
  storeName: "Store",
  currency: "KES",
  theme: { fontPair: "editorial-serif" },
};

export const getStoreSettings = unstable_cache(
  async () => {
    await connectToDatabase();
    const settings = await StoreSettings.findOne().lean();
    return settings ? JSON.parse(JSON.stringify(settings)) : DEFAULTS;
  },
  ["store-settings"],
  { tags: ["settings"], revalidate: 300 }
);
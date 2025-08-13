import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

// Flat config 就是一個設定物件的陣列
const eslintConfig = [
  // 1. 將 compat.extends 回傳的陣列直接展開到這裡
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // 2. 將你自訂的規則作為一個新的物件加到陣列中
  {
    rules: {
      // 這裡的規則會覆蓋前面的設定
      "@typescript-eslint/no-unused-vars": "off",
      "prefer-const": "off",
      // 修正了規則名稱，並設定為關閉
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];

export default eslintConfig;

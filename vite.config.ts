import { defineConfig } from "vite";
import vike from "vike/plugin";
import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    tailwindcss(),
    mdx(),
    vike(),
  ],
});

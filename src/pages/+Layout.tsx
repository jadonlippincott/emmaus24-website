import type { ReactNode } from "react";
import Layout from "../components/Layout";
import "../styles/global.css";

export default function Page({ children }: { children: ReactNode }) {
  return <Layout>{children}</Layout>;
}

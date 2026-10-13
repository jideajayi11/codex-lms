import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata = {
  title: "Staywise — Learning that stays with you",
  description:
    "Find your resources. Make a plan. Keep moving. A learning companion demo.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

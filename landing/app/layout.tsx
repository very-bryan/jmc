import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "진만추 - 검증된 진지한 만남",
  description:
    "실명 검증 기반, 결혼 의향이 있는 사람들이 진지한 관계를 만드는 커뮤니티. 첫 1,000명 무료.",
  openGraph: {
    title: "진만추 - 검증된 진지한 만남",
    description: "결혼정보회사급 신뢰 + 앱의 접근성. 첫 1,000명 무료 사전등록 중.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${geist.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}

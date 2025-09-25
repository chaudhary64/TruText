import "./globals.css";

export const metadata = {
  title: "TruText - AI Text Detector",
  description: "Detect AI-Generated Text Instantly and Accurately",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#EEEEEE]">{children}</body>
    </html>
  );
}

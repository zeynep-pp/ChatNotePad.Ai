import "./globals.css";

export const metadata = {
  title: "ChatNotePadAi",
  description: "AI-powered note editing and transformation with natural language commands.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}

import AuthenticatedLayout from "../authenticated-layout";

export default function StockLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
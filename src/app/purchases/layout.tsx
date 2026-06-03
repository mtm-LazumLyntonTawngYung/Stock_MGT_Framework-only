import AuthenticatedLayout from "../authenticated-layout";

export default function PurchasesLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}
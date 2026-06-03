import AuthenticatedLayout from "../authenticated-layout";

export default function PasswordLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <AuthenticatedLayout>{children}</AuthenticatedLayout>;
}

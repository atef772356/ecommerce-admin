export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center h-full w-full bg-slate-100 h-screen">
      {children}
    </div>
  );
}

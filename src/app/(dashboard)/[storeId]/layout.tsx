import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";

import prismadb from "../../../../lib/prismadb";
import Navbar from "@/components/navbar";

export default async function DashboardLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  // 💡 التعديل 1: خلينا الـ params عبارة عن Promise
  params: Promise<{ storeId: string }>;
}) {
  // 1. من هو المستخدم؟
  const { userId } = await auth();

  // 💡 التعديل 2: فكينا الـ Promise واستنينا الـ storeId
  const { storeId } = await params;

  // 2. إذا لم يسجل دخول، ارسله لصفحة التسجيل
  if (!userId) {
    redirect("/sign-in");
  }

  // 3. هل هذا المتجر موجود فعلاً؟ وهل يملكه هذا المستخدم؟
  const store = await prismadb.store.findFirst({
    where: {
      id: storeId, // 💡 استخدمنا الـ storeId اللي استخرجناه فوق
      userId, // ونتأكد أن الـ userId مطابق لصاحب المتجر
    },
  });

  // 4. إذا لم يجد المتجر (أو المستخدم يحاول سرقة متجر غيره)
  if (!store) {
    redirect("/"); // اطرده للصفحة الرئيسية
  }

  // 5. إذا كله تمام، اظهر لوحة التحكم
  return (
    <>
      <Navbar />
      {children}
    </>
  );
}

import { NextResponse } from "next/server";

import prismadb from "../../../../lib/prismadb";
import { auth } from "@clerk/nextjs/server";

export async function POST(req: Request) {
  try {
    // 1. التحقق من المستخدم (Hiring Security)
    const { userId } = await auth();

    // 2. قراءة البيانات القادمة من الفورم
    const body = await req.json();
    const { name } = body;

    // 3. حماية: هل المستخدم مسجل دخول؟
    if (!userId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // 4. حماية: هل الاسم موجود؟
    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // 5. العملية الرئيسية: الحفظ في قاعدة البيانات
    const store = await prismadb.store.create({
      data: {
        name,
        userId,
      },
    });

    // 6. الرد بنجاح (إرجاع المتجر الجديد)
    return NextResponse.json(store);
  } catch (error) {
    // 7. في حالة حدوث مصيبة (سيرفر وقع، نت فصل)
    console.log("[STORES_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

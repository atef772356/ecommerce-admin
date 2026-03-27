import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server"; // أو @clerk/nextjs حسب نسختك

import prismadb from "../../../../../lib/prismadb";

// 1. دالة التعديل (PATCH)
export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string } },
) {
  try {
    const { userId } = await auth();
    const body = await req.json();

    const { name } = body;

    // بما أننا في Next.js 15 قد نحتاج لانتظار البراميترز
    const { storeId } = await params;

    // --- منطقة التحقق (Validation) ---
    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }
    // -------------------------------

    // --- التنفيذ (Update) ---
    // شرط مهم جداً: نحدث المتجر فقط إذا كان الـ id صحيحاً والـ userId يطابق المالك
    const store = await prismadb.store.updateMany({
      where: {
        id: storeId,
        userId,
      },
      data: {
        name,
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.log("[STORE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// 2. دالة الحذف (DELETE)
export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string } },
) {
  try {
    const { userId } = await auth();

    // انتظار البراميترز
    const { storeId } = await params;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    // --- التنفيذ (Delete) ---
    // نحذف فقط إذا كنت أنت المالك
    const store = await prismadb.store.deleteMany({
      where: {
        id: storeId,
        userId,
      },
    });

    return NextResponse.json(store);
  } catch (error) {
    console.log("[STORE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

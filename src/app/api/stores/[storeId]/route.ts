import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "../../../../../lib/prismadb";
export const dynamic = "force-dynamic";
// 1. دالة التعديل (PATCH)
export async function PATCH(
  req: Request,
  // 💡 التعديل هنا: ضفنا Promise في تعريف النوع
  { params }: { params: Promise<{ storeId: string }> },
) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { name } = body;

    // فك الـ Promise
    const { storeId } = await params;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    // نحدث المتجر فقط إذا كان الـ id والـ userId يطابق المالك
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
  // 💡 التعديل هنا كمان: ضفنا Promise
  { params }: { params: Promise<{ storeId: string }> },
) {
  try {
    const { userId } = await auth();
    const { storeId } = await params;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

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

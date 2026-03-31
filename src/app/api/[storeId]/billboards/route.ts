import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "../../../../../lib/prismadb";
export const dynamic = "force-dynamic";
// 1. إنشاء لوحة (POST)
export async function POST(
  req: Request,
  // 💡 اتصلحت: شلنا القوس الزيادة
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { userId } = await auth();
    // 💡 اتصلحت: استدعيناها مرة واحدة بس
    const { storeId } = await params;
    
    const body = await req.json();
    const { label, imageUrl } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!label) {
      return new NextResponse("Label is required", { status: 400 });
    }

    if (!imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 });
    }

    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    // تحقق من أن المستخدم هو صاحب المتجر
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    // إنشاء اللوحة
    const billboard = await prismadb.billboard.create({
      data: {
        label,
        imageUrl,
        storeId,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARDS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// 2. جلب جميع اللوحات (GET)
export async function GET(
  req: Request,
  // 💡 اتصلحت: ضفنا الـ Promise هنا
  { params }: { params: Promise<{ storeId: string }> }
) {
  try {
    const { storeId } = await params;

    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const billboards = await prismadb.billboard.findMany({
      where: {
        storeId,
      },
    });

    return NextResponse.json(billboards);
  } catch (error) {
    console.log("[BILLBOARDS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

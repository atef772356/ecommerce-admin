import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

// 👇 استخدمنا المسار النسبي زي ما طلبت (4 خطوات للخلف للوصول لمجلد lib)
import prismadb from "../../../../../lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> },
) {
  try {
    const { userId } = await auth();
    const body = await req.json();

    // الحجم بيحتاج اسم (مثال: Small) وقيمة (مثال: S)
    const { name, value } = body;
    const { storeId } = await params;

    if (!userId) return new NextResponse("Unauthenticated", { status: 403 });
    if (!name) return new NextResponse("Name is required", { status: 400 });
    if (!value) return new NextResponse("Value is required", { status: 400 });
    if (!storeId)
      return new NextResponse("Store id is required", { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!storeByUserId)
      return new NextResponse("Unauthorized", { status: 405 });

    const size = await prismadb.size.create({
      data: {
        name,
        value,
        storeId,
      },
    });

    return NextResponse.json(size);
  } catch (error) {
    console.log("[SIZES_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> },
) {
  try {
    const { storeId } = await params;
    if (!storeId)
      return new NextResponse("Store id is required", { status: 400 });

    const sizes = await prismadb.size.findMany({
      where: { storeId },
    });

    return NextResponse.json(sizes);
  } catch (error) {
    console.log("[SIZES_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

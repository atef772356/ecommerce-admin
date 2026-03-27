import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "../../../../../../lib/prismadb";

export async function GET(
  req: Request,
  // 💡 التعديل هنا: ضفنا storeId عشان يطابق مسار المجلدات الأبوية
  { params }: { params: Promise<{ storeId: string; sizeId: string }> },
) {
  try {
    const { sizeId } = await params;
    if (!sizeId)
      return new NextResponse("Size id is required", { status: 400 });

    const size = await prismadb.size.findUnique({
      where: { id: sizeId },
    });

    return NextResponse.json(size);
  } catch (error) {
    console.log("[SIZE_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ sizeId: string; storeId: string }> },
) {
  try {
    const { userId } = await auth();
    const { sizeId, storeId } = await params;

    if (!userId) return new NextResponse("Unauthenticated", { status: 403 });
    if (!sizeId)
      return new NextResponse("Size id is required", { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!storeByUserId)
      return new NextResponse("Unauthorized", { status: 405 });

    const size = await prismadb.size.delete({
      where: { id: sizeId },
    });

    return NextResponse.json(size);
  } catch (error) {
    console.log("[SIZE_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ sizeId: string; storeId: string }> },
) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { name, value } = body;
    const { sizeId, storeId } = await params;

    if (!userId) return new NextResponse("Unauthenticated", { status: 403 });
    if (!name) return new NextResponse("Name is required", { status: 400 });
    if (!value) return new NextResponse("Value is required", { status: 400 });
    if (!sizeId)
      return new NextResponse("Size id is required", { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: storeId, userId },
    });

    if (!storeByUserId)
      return new NextResponse("Unauthorized", { status: 405 });

    const size = await prismadb.size.update({
      where: { id: sizeId },
      data: { name, value },
    });

    return NextResponse.json(size);
  } catch (error) {
    console.log("[SIZE_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

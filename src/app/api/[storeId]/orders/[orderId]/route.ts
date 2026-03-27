import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "../../../../../../lib/prismadb";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ storeId: string; orderId: string }> },
) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { status } = body;
    const resolvedParams = await params;

    if (!userId) return new NextResponse("Unauthenticated", { status: 403 });
    if (!status) return new NextResponse("Status is required", { status: 400 });
    if (!resolvedParams.orderId)
      return new NextResponse("Order id is required", { status: 400 });

    // بنتأكد إن التاجر ده هو صاحب المتجر فعلاً
    const storeByUserId = await prismadb.store.findFirst({
      where: { id: resolvedParams.storeId, userId },
    });

    if (!storeByUserId)
      return new NextResponse("Unauthorized", { status: 405 });

    // بنحدث حالة الطلب
    const order = await prismadb.order.update({
      where: { id: resolvedParams.orderId },
      data: { status },
    });

    return NextResponse.json(order);
  } catch (error) {
    console.log("[ORDER_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

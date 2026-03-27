import { NextResponse } from "next/server";
import prismadb from "../../../../../../lib/prismadb";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ storeId: string; userId: string }> },
) {
  try {
    const resolvedParams = await params;

    if (!resolvedParams.userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }

    const orders = await prismadb.order.findMany({
      where: {
        storeId: resolvedParams.storeId,
        // 💡 التعديل السحري: بندور على الطلب عن طريق حساب الـ Clerk (externalId) بتاع العميل
        user: {
          externalId: resolvedParams.userId,
        },
      },
      include: {
        orderItems: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(orders, { headers: corsHeaders });
  } catch (error) {
    console.log("[CUSTOMER_ORDERS_GET]", error);
    return new NextResponse("Internal error", {
      status: 500,
      headers: corsHeaders,
    });
  }
}

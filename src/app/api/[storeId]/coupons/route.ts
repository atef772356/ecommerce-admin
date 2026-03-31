import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "../../../../../lib/prismadb";
export const dynamic = "force-dynamic";
// 💡 تصريح المرور السحري (CORS) عشان المتجر يقدر يكلم الداشبورد
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// المتصفح بيبعت الطلب ده الأول يتأكد إن الطريق أمان
export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> },
) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { code, discountPercentage, expiresAt } = body;
    const resolvedParams = await params;

    if (!userId) return new NextResponse("Unauthenticated", { status: 403 });
    if (!code) return new NextResponse("Code is required", { status: 400 });
    if (!discountPercentage)
      return new NextResponse("Discount percentage is required", {
        status: 400,
      });
    if (!expiresAt)
      return new NextResponse("Expiration date is required", { status: 400 });
    if (!resolvedParams.storeId)
      return new NextResponse("Store id is required", { status: 400 });

    const storeByUserId = await prismadb.store.findFirst({
      where: { id: resolvedParams.storeId, userId },
    });

    if (!storeByUserId)
      return new NextResponse("Unauthorized", { status: 405 });

    const coupon = await prismadb.coupon.create({
      data: {
        code,
        discountPercentage,
        expiresAt: new Date(expiresAt),
        storeId: resolvedParams.storeId,
      },
    });

    // 💡 ضفنا الـ headers هنا
    return NextResponse.json(coupon, { headers: corsHeaders });
  } catch (error) {
    console.log("[COUPONS_POST]", error);
    return new NextResponse("Internal error", {
      status: 500,
      headers: corsHeaders,
    });
  }
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> },
) {
  try {
    const resolvedParams = await params;
    if (!resolvedParams.storeId)
      return new NextResponse("Store id is required", { status: 400 });

    const coupons = await prismadb.coupon.findMany({
      where: { storeId: resolvedParams.storeId },
      orderBy: { createdAt: "desc" },
    });

    // 💡 وضفنا الـ headers هنا كمان
    return NextResponse.json(coupons, { headers: corsHeaders });
  } catch (error) {
    console.log("[COUPONS_GET]", error);
    return new NextResponse("Internal error", {
      status: 500,
      headers: corsHeaders,
    });
  }
}

import Stripe from "stripe";
import { NextResponse } from "next/server";
import prismadb from "../../../../../lib/prismadb";
import { stripe } from "../../../../../lib/stripe";
export const dynamic = "force-dynamic";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ storeId: string }> },
) {
  try {
    // 💡 التعديل 1: ضفنا discountPercentage هنا عشان نستلمها من المتجر
    const { productIds, userId, email, name, discountPercentage } =
      await req.json();
    const resolvedParams = await params;

    if (!productIds || productIds.length === 0) {
      return new NextResponse("Product ids are required", { status: 400 });
    }

    if (!userId || !email) {
      return new NextResponse("User authentication details are required", {
        status: 401,
      });
    }

    // بنسجل العميل في الداتابيز لو مش موجود
    let dbUser = await prismadb.user.findUnique({
      where: { externalId: userId },
    });

    if (!dbUser) {
      dbUser = await prismadb.user.create({
        data: {
          externalId: userId,
          email: email,
          name: name || "New Customer",
          role: "CUSTOMER",
        },
      });
    }

    const products = await prismadb.product.findMany({
      where: {
        id: {
          in: productIds,
        },
      },
    });

    const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

    products.forEach((product) => {
      line_items.push({
        quantity: 1,
        price_data: {
          currency: "USD",
          product_data: {
            name: product.name,
          },
          unit_amount: Math.round(Number(product.price) * 100),
        },
      });
    });

    // بنعمل الطلب ونربطه بالعميل
    const order = await prismadb.order.create({
      data: {
        storeId: resolvedParams.storeId,
        userId: dbUser.id,
        isPaid: false, // 👈 يفضل تكون false لحد ما Stripe يأكد الدفع (لو عامل Webhook)
        discount: discountPercentage ? Number(discountPercentage) : 0,
        orderItems: {
          create: productIds.map((productId: string) => ({
            product: {
              connect: {
                id: productId,
              },
            },
          })),
        },
      },
    });

    // 💡 التعديل 2: ظبطنا المصفوفة وخليناها const عشان الـ TypeScript ميزعلش
    const stripeDiscounts: { coupon: string }[] = [];

    if (discountPercentage && discountPercentage > 0) {
      const stripeCoupon = await stripe.coupons.create({
        percent_off: Number(discountPercentage),
        duration: "once",
      });
      stripeDiscounts.push({ coupon: stripeCoupon.id });
    }

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: "payment",
      billing_address_collection: "required",
      phone_number_collection: { enabled: true },
      success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
      cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
      metadata: { orderId: order.id },
      // بيبعت الخصم لو موجود
      discounts: stripeDiscounts.length > 0 ? stripeDiscounts : undefined,
    });

    return NextResponse.json(
      { url: session.url },
      {
        headers: corsHeaders,
      },
    );
  } catch (error) {
    console.log("[CHECKOUT_ERROR]", error);
    return new NextResponse("Internal Error", {
      headers: corsHeaders,
      status: 500,
    });
  }
}

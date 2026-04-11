import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "../../../../../lib/prismadb";

export const dynamic = "force-dynamic";

export async function POST(req: Request, context: any) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const params = await context.params;
    const { storeId } = params;

    const {
      name,
      price,
      categoryId,
      images,
      isFeatured,
      isArchived,
    } = body;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!images || !images.length) {
      return new NextResponse("Images are required", { status: 400 });
    }

    if (!price) {
      return new NextResponse("Price is required", { status: 400 });
    }

    if (!categoryId) {
      return new NextResponse("Category id is required", { status: 400 });
    }

    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const product = await prismadb.product.create({
      data: {
        name,
        price,
        isFeatured,
        isArchived,
        categoryId,
        storeId,
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCTS_POST]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(req: Request, context: any) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("categoryId") || undefined;
    const isFeatured = searchParams.get("isFeatured");
    
    // 💡 الفلاتر الجديدة
    const minPrice = searchParams.get("minPrice");
    const maxPrice = searchParams.get("maxPrice");
    const sort = searchParams.get("sort");

    const params = await context.params;
    const { storeId } = params;

    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    // 💡 إعداد ترتيب المنتجات
    let orderBy: any = { createdAt: "desc" };
    if (sort === "price-asc") orderBy = { price: "asc" };
    if (sort === "price-desc") orderBy = { price: "desc" };

    const products = await prismadb.product.findMany({
      where: {
        storeId,
        categoryId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
        // 💡 فلترة السعر
        price: {
          gte: minPrice ? parseFloat(minPrice) : undefined,
          lte: maxPrice ? parseFloat(maxPrice) : undefined,
        }
      },
      include: {
        images: true,
        category: true,
      },
      orderBy,
    });

    return NextResponse.json(products);
  } catch (error) {
    console.log("[PRODUCTS_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

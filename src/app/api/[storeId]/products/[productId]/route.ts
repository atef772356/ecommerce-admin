import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import prismadb from "../../../../../../lib/prismadb";

export const dynamic = "force-dynamic";

export async function GET(req: Request, context: any) {
  try {
    const params = await context.params;
    const { productId } = params;

    if (!productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const product = await prismadb.product.findUnique({
      where: {
        id: productId,
      },
      include: {
        images: true,
        category: true,
        // 💡 مسحنا اللون والمقاس من هنا
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(req: Request, context: any) {
  try {
    const { userId } = await auth();
    const params = await context.params;
    const { storeId, productId } = params;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!productId) {
      return new NextResponse("Product id is required", { status: 400 });
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

    const product = await prismadb.product.delete({
      where: {
        id: productId,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(req: Request, context: any) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const params = await context.params;
    const { storeId, productId } = params;

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

    if (!productId) {
      return new NextResponse("Product id is required", { status: 400 });
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

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    // أولاً: بنحدث بيانات المنتج الأساسية وبنحذف كل الصور القديمة
    await prismadb.product.update({
      where: {
        id: productId,
      },
      data: {
        name,
        price,
        categoryId,
        // 💡 مسحنا اللون والمقاس من هنا
        images: {
          deleteMany: {},
        },
        isFeatured,
        isArchived,
      },
    });

    // ثانياً: بنضيف الصور الجديدة
    const product = await prismadb.product.update({
      where: {
        id: productId,
      },
      data: {
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

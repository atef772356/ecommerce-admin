import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prismadb from "../../../../../../lib/prismadb";

// GET (Single Billboard)
export async function GET(
  req: Request,
  // 💡 التعديل هنا: ضفنا Promise و storeId
  { params }: { params: Promise<{ storeId: string; billboardId: string }> },
) {
  try {
    const { billboardId } = await params;

    if (!billboardId) {
      return new NextResponse("Billboard id is required", { status: 400 });
    }

    const billboard = await prismadb.billboard.findUnique({
      where: {
        id: billboardId,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_GET]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// DELETE
export async function DELETE(
  req: Request,
  // 💡 التعديل هنا: ضفنا Promise
  { params }: { params: Promise<{ storeId: string; billboardId: string }> },
) {
  try {
    const { userId } = await auth();
    const { billboardId, storeId } = await params;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!billboardId) {
      return new NextResponse("Billboard id is required", { status: 400 });
    }

    // التحقق من الملكية
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,
        userId,
      },
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const billboard = await prismadb.billboard.delete({
      where: {
        id: billboardId,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_DELETE]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

// PATCH (Update)
export async function PATCH(
  req: Request,
  // 💡 التعديل هنا: ضفنا Promise
  { params }: { params: Promise<{ storeId: string; billboardId: string }> },
) {
  try {
    const { userId } = await auth();
    const body = await req.json();
    const { label, imageUrl } = body;
    const { billboardId, storeId } = await params;

    if (!userId) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!label) {
      return new NextResponse("Label is required", { status: 400 });
    }

    if (!imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 });
    }

    if (!billboardId) {
      return new NextResponse("Billboard id is required", { status: 400 });
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

    const billboard = await prismadb.billboard.update({
      where: {
        id: billboardId,
      },
      data: {
        label,
        imageUrl,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD_PATCH]", error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

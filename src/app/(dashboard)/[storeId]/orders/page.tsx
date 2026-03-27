import { format } from "date-fns";

import { formatter } from "../../../../../lib/utils";

import { OrderClient } from "./components/client";
import { OrderColumn } from "./components/columns";
import prismadb from "../../../../../lib/prismadb";

const OrdersPage = async ({ params }: { params: { storeId: string } }) => {
  const orders = await prismadb.order.findMany({
    where: {
      storeId: params.storeId,
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

  const formattedOrders = orders.map((item) => {
    // 1. بنجمع السعر الأصلي
    const orderTotal = item.orderItems.reduce((total, orderItem) => {
      return total + Number(orderItem.product.price);
    }, 0);

    // 2. بنحسب الخصم لو موجود ونطرحه
    const discountAmount = item.discount
      ? (orderTotal * item.discount) / 100
      : 0;
    const finalTotal = orderTotal - discountAmount;

    return {
      id: item.id,
      phone: item.phone,
      address: item.address,
      products: item.orderItems
        .map((orderItem) => orderItem.product.name)
        .join(", "),
      totalPrice: formatter.format(finalTotal), // 👈 السعر النهائي بعد الخصم
      isPaid: item.isPaid,
      status: item.status,
      createdAt: format(item.createdAt, "MMMM do, yyyy"),
    };
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderClient data={formattedOrders} />
      </div>
    </div>
  );
};

export default OrdersPage;

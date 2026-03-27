import prismadb from "../lib/prismadb";

export const getTotalRevenue = async (storeId: string) => {
  const paidOrders = await prismadb.order.findMany({
    where: {
      storeId,
      isPaid: true,
      status: { not: "CANCELED" }, // بنحسب الطلبات المدفوعة بس
    },
    include: {
      orderItems: {
        include: {
          product: true,
        },
      },
    },
  });

  const totalRevenue = paidOrders.reduce((total, order) => {
    // بنجمع سعر المنتجات
    const orderTotal = order.orderItems.reduce((orderSum, item) => {
      return orderSum + Number(item.product.price);
    }, 0);

    // 💡 بنحسب قيمة الخصم ونطرحها
    const discountAmount = order.discount
      ? (orderTotal * order.discount) / 100
      : 0;
    const finalOrderTotal = orderTotal - discountAmount;

    return total + finalOrderTotal;
  }, 0);

  return totalRevenue;
};

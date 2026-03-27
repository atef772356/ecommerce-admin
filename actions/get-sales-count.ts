import prismadb from "../lib/prismadb";

export const getSalesCount = async (storeId: string) => {
  const salesCount = await prismadb.order.count({
    where: {
      storeId,
      isPaid: true,
      status: { not: "CANCELED" },
    },
  });

  return salesCount;
};

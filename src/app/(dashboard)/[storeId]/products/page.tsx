import { format } from "date-fns";

import { ProductColumn } from "./components/columns";
import prismadb from "../../../../../lib/prismadb";
import { ProductClient } from "./components/client";

// دالة بسيطة لتنسيق السعر
const formatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const ProductsPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;

  // هنجيب المنتجات ومعاها الفئة بس
  const products = await prismadb.product.findMany({
    where: {
      storeId,
    },
    include: {
      category: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedProducts: ProductColumn[] = products.map((item) => ({
    id: item.id,
    name: item.name,
    isFeatured: item.isFeatured,
    isArchived: item.isArchived,
    price: formatter.format(item.price.toNumber()), 
    category: item.category.name,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductClient data={formattedProducts} />
      </div>
    </div>
  );
};

export default ProductsPage;

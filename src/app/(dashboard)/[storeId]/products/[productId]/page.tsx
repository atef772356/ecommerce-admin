import prismadb from "../../../../../../lib/prismadb";
import { ProductForm } from "./components/product-form";

const ProductPage = async ({
  params,
}: {
  params: Promise<{ productId: string; storeId: string }>;
}) => {
  const { productId, storeId } = await params;

  // بنجيب بيانات المنتج لو كان موجود (للتعديل) وبنجيب معاه صوره
  const product = await prismadb.product.findUnique({
    where: {
      id: productId,
    },
    include: {
      images: true,
    },
  });

  // بنجيب كل الفئات عشان نعرضهم في قوائم الاختيار (Select)
  const categories = await prismadb.category.findMany({
    where: {
      storeId,
    },
  });

  // 💡 مسحنا جلب الألوان والمقاسات من هنا عشان معدناش محتاجينهم

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ProductForm
          categories={categories}
          // 💡 مسحنا تمرير الألوان والمقاسات للفورمة
          initialData={product}
        />
      </div>
    </div>
  );
};

export default ProductPage;

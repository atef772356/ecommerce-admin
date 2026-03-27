import prismadb from "../../../../../../lib/prismadb";
import { CategoryForm } from "./components/category-form";

const CategoryPage = async ({
  params,
}: {
  params: Promise<{ categoryId: string; storeId: string }>;
}) => {
  // 1. انتظار البيانات (Next.js 15 Fix)
  const { categoryId, storeId } = await params;

  // 2. جلب بيانات الفئة (إذا لم يكن الرابط "new")
  const category =
    categoryId === "new"
      ? null
      : await prismadb.category.findUnique({
          where: {
            id: categoryId,
          },
        });

  // 3. جلب كل اللوحات الإعلانية الخاصة بهذا المتجر
  // (هذا ضروري لكي تظهر اللوحات في القائمة المنسدلة داخل الفورم)
  const billboards = await prismadb.billboard.findMany({
    where: {
      storeId: storeId,
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoryForm billboards={billboards} initialData={category} />
      </div>
    </div>
  );
};

export default CategoryPage;

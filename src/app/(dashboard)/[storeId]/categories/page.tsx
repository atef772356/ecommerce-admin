import { format } from "date-fns";

// استخدام المسار النسبي (4 خطوات للخلف)
import prismadb from "../../../../../lib/prismadb";
import { CategoryColumn } from "./[categoryId]/components/columns";
import { CategoryClient } from "./[categoryId]/components/client";

const CategoriesPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;

  // هنجيب الفئات ومعاها اللوحة الإعلانية المرتبطة بيها
  const categories = await prismadb.category.findMany({
    where: {
      storeId,
    },
    include: {
      billboard: true, // 👈 دي اللي هتخلينا نعرض اسم اللوحة في الجدول
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  const formattedCategories: CategoryColumn[] = categories.map((item) => ({
    id: item.id,
    name: item.name,
    billboardLabel: item.billboard.label,
    createdAt: format(item.createdAt, "MMMM do, yyyy"),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CategoryClient data={formattedCategories} />
      </div>
    </div>
  );
};

export default CategoriesPage;

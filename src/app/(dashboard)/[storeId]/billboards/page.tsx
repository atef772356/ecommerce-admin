import { format } from "date-fns";

import prismadb from "../../../../../lib/prismadb";
import { BillboardClient } from "./[billboardId]/components/client";
import { BillboardColumn } from "./[billboardId]/components/columns";

const BillboardsPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const { storeId } = await params;

  const billboards = await prismadb.billboard.findMany({
    where: {
      storeId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  // 👇 تحويل البيانات لتناسب الجدول (تنسيق التاريخ)
  const formattedBillboards: BillboardColumn[] = billboards.map((item) => ({
    id: item.id,
    label: item.label,
    createdAt: format(item.createdAt, "MMMM do, yyyy"), // مثلاً: June 12th, 2023
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {/* نمرر البيانات المنسقة formattedBillboards */}
        <BillboardClient data={formattedBillboards} />
      </div>
    </div>
  );
};

export default BillboardsPage;

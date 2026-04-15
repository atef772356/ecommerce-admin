import { CreditCard, DollarSign, Package } from "lucide-react";

import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTotalRevenue } from "../../../../actions/get-total-revenue";
import { getSalesCount } from "../../../../actions/get-sales-count";
import { getStockCount } from "../../../../actions/get-stock-count";
import { formatter } from "../../../../lib/utils";

import { Overview } from "@/components/overview";
import { getGraphRevenue } from "../../../../actions/get-graph-revenue";
import { withRetry } from "@/utils/dbRetry";
interface DashboardPageProps {
  // 💡 التعديل 1: حولنا الـ params لـ Promise
  params: Promise<{
    storeId: string;
  }>;
}

// 💡 التعديل 2: شلنا React.FC وخليناها دالة async عادية جداً
export default async function DashboardPage({ params }: DashboardPageProps) {
  // 💡 التعديل 3: استنينا الـ Promise عشان نطلع منه الـ storeId
  const { storeId } = await params;

  // سحب البيانات من الداتا بيز باستخدام الـ Actions (بالـ storeId الجديد)
const totalRevenue = await withRetry(() => getTotalRevenue(storeId));
  const salesCount = await withRetry(() => getSalesCount(storeId));
  const stockCount = await withRetry(() => getStockCount(storeId));
  const graphRevenue = await withRetry(() => getGraphRevenue(storeId));
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <Heading title="Dashboard" description="Overview of your store" />
        <Separator />

        {/* شبكة الكروت */}
        <div className="grid gap-4 grid-cols-3">
          {/* كارت إجمالي الأرباح */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Revenue
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatter.format(totalRevenue)}
              </div>
            </CardContent>
          </Card>

          {/* كارت عدد المبيعات */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Sales</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">+{salesCount}</div>
            </CardContent>
          </Card>

          {/* كارت المنتجات المتاحة */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Products In Stock
              </CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stockCount}</div>
            </CardContent>
          </Card>
          
          <Card className="col-span-4 mt-4">
            <CardHeader>
              <CardTitle>Overview</CardTitle>
            </CardHeader>
            <CardContent className="pl-2">
              <Overview data={graphRevenue} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

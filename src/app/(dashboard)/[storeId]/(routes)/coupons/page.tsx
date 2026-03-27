import Link from "next/link";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import prismadb from "../../../../../../lib/prismadb";

const CouponsPage = async ({
  params,
}: {
  params: Promise<{ storeId: string }>;
}) => {
  const resolvedParams = await params;

  // بنجيب كل الكوبونات الخاصة بالمتجر ده
  const coupons = await prismadb.coupon.findMany({
    where: {
      storeId: resolvedParams.storeId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        {/* الهيدر وزرار الإضافة */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">
              Coupons ({coupons.length})
            </h2>
            <p className="text-sm text-muted-foreground">
              Manage discount codes for your store
            </p>
          </div>
          <Link href={`/${resolvedParams.storeId}/coupons/new`}>
            <Button className="bg-black text-white hover:bg-gray-800">
              <Plus className="mr-2 h-4 w-4" /> Add New
            </Button>
          </Link>
        </div>

        <Separator />

        {/* عرض الكوبونات المتاحة */}
        {coupons.length === 0 ? (
          <p className="text-neutral-500 text-center py-10">
            No coupons found. Click Add New to create one.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {coupons.map((item) => (
              <div
                key={item.id}
                className="border p-6 rounded-lg shadow-sm bg-white flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-xl text-black">{item.code}</h3>
                  <p className="text-sm font-medium text-green-600 mt-1">
                    {item.discountPercentage}% OFF
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t text-sm text-gray-500">
                  Expires: {new Date(item.expiresAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponsPage;

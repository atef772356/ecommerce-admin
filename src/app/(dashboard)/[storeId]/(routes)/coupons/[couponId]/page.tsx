import prismadb from "../../../../../../../lib/prismadb";
import { CouponForm } from "./components/coupon-form";

const CouponPage = async ({
  params,
}: {
  params: Promise<{ storeId: string; couponId: string }>;
}) => {
  const resolvedParams = await params;
  let coupon = null;

  // لو الرابط مش 'new'، بنجيب بيانات الكوبون القديم عشان نعدله
  if (resolvedParams.couponId !== "new") {
    coupon = await prismadb.coupon.findUnique({
      where: { id: resolvedParams.couponId },
    });
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CouponForm initialData={coupon} />
      </div>
    </div>
  );
};

export default CouponPage;

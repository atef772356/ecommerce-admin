import prismadb from "../../../../../../lib/prismadb";
import { BillboardForm } from "./components/billboard-form";

const BillboardPage = async ({
  params,
}: {
  params: { billboardId: string };
}) => {
  // هنا الخدعة: إذا كان الرابط "new"، سنمرر null
  // وإلا سنبحث عن اللوحة في قاعدة البيانات

  // بسبب تحديث Next.js 15
  const { billboardId } = await params;

  // إذا كان ID هو "new" (يعني إنشاء جديد)، لن نبحث في الداتابيس
  const billboard =
    billboardId === "new"
      ? null
      : await prismadb.billboard.findUnique({
          where: {
            id: billboardId,
          },
        });

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <BillboardForm initialData={billboard} />
      </div>
    </div>
  );
};

export default BillboardPage;

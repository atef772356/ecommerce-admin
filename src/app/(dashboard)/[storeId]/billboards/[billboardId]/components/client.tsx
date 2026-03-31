"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
// 💡 التعديل 1: مسحنا استيراد Billboard بتاع Prisma

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";

// 💡 التعديل 2: استوردنا النوع الصح من ملف الـ columns
import { columns, BillboardColumn } from "./columns";

interface BillboardClientProps {
  // 💡 التعديل 3: غيرنا النوع من Billboard لـ BillboardColumn
  data: BillboardColumn[];
}

export const BillboardClient: React.FC<BillboardClientProps> = ({ data }) => {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Billboards (${data.length})`}
          description="Manage billboards for your store"
        />
        <Button
          onClick={() => router.push(`/${params.storeId}/billboards/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />

      <DataTable searchKey="label" columns={columns} data={data} />
    </>
  );
};

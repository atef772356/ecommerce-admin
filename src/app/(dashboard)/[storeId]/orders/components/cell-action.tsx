"use client";

import axios from "axios";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { useRouter, useParams } from "next/navigation";

export const CellAction = ({ data }: { data: any }) => {
  const router = useRouter();
  const params = useParams();
  const [loading, setLoading] = useState(false);

  const onUpdateStatus = async (newStatus: string) => {
    try {
      setLoading(true);
      // بيكلم الـ API اللي عملناه فوق عشان يغير الحالة
      await axios.patch(`/api/${params.storeId}/orders/${data.id}`, {
        status: newStatus,
      });
      toast.success("Order status updated! 🔥");
      router.refresh(); // بيعمل ريفريش للصفحة عشان التعديل يظهر
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <select
      disabled={loading}
      value={data.status}
      onChange={(e) => onUpdateStatus(e.target.value)}
      className="border border-gray-300 rounded-md p-2 text-sm font-semibold outline-none cursor-pointer hover:bg-gray-50 transition">
      <option value="PENDING">⏳ Pending</option>
      <option value="PROCESSING">⚙️ Processing</option>
      <option value="SHIPPED">🚚 Shipped</option>
      <option value="DELIVERED">✅ Delivered</option>
      <option value="CANCELED">❌ Canceled</option>
    </select>
  );
};

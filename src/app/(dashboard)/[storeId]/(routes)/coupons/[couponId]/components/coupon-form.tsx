"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";
import { Coupon } from "@prisma/client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";

// 💡 التعديل 1: شيلنا coerce وخليناها z.number() صريحة ومباشرة
const formSchema = z.object({
  code: z.string().min(3, "Code must be at least 3 characters"),
  discountPercentage: z.number().min(1).max(100),
  expiresAt: z.string().min(1, "Expiration date is required"),
});

type CouponFormValues = z.infer<typeof formSchema>;

export const CouponForm = ({ initialData }: { initialData: Coupon | null }) => {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit coupon" : "Create coupon";
  const description = initialData
    ? "Edit an existing coupon."
    : "Add a new coupon for your store.";
  const toastMessage = initialData
    ? "Coupon updated."
    : "Coupon created successfully! 🎉";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<CouponFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData
      ? {
          code: initialData.code,
          discountPercentage: Number(initialData.discountPercentage),
          expiresAt: new Date(initialData.expiresAt)
            .toISOString()
            .split("T")[0],
        }
      : {
          code: "",
          discountPercentage: 10,
          expiresAt: "",
        },
  });

  const onSubmit = async (data: CouponFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(
          `/api/${params.storeId}/coupons/${params.couponId}`,
          data,
        );
      } else {
        await axios.post(`/api/${params.storeId}/coupons`, data);
      }
      router.push(`/${params.storeId}/coupons`);
      router.refresh();
      toast.success(toastMessage);
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <Separator className="my-4" />
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8 w-full">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Coupon Code</FormLabel>
                  <FormControl>
                    <Input
                      disabled={loading}
                      placeholder="e.g. WINTER20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="discountPercentage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Discount Percentage (%)</FormLabel>
                  <FormControl>
                    {/* 💡 التعديل 2: بنحول القيمة لرقم في الـ onChange */}
                    <Input
                      type="number"
                      disabled={loading}
                      placeholder="20"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="expiresAt"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiration Date</FormLabel>
                  <FormControl>
                    <Input type="date" disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button
            disabled={loading}
            className="bg-black text-white hover:bg-gray-800"
            type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};

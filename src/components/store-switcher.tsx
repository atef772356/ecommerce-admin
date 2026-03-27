"use client";

import * as React from "react";
import {
  Check,
  ChevronsUpDown,
  PlusCircle,
  Store as StoreIcon,
} from "lucide-react";

import { cn } from "../../lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useStoreModal } from "@/hooks/use-store-modal";
import { useParams, useRouter } from "next/navigation";
import { Store } from ".prisma/client";
import { useState, useEffect } from "react"; // 👈 أضف هذا السطر
type PopoverTriggerProps = React.ComponentPropsWithoutRef<
  typeof PopoverTrigger
>;

interface StoreSwitcherProps extends PopoverTriggerProps {
  items: Store[]; // قائمة المتاجر القادمة من قاعدة البيانات
}

export default function StoreSwitcher({
  className,
  items = [],
}: StoreSwitcherProps) {
  const storeModal = useStoreModal();
  const params = useParams();
  const router = useRouter();

  // 1. تنسيق القائمة: نحدد أي متجر هو المختار حالياً
  const formattedItems = items.map((item) => ({
    label: item.name,
    value: item.id,
  }));

  // معرفة المتجر النشط حالياً لعرض اسمه على الزر
  const currentStore = formattedItems.find(
    (item) => item.value === params.storeId,
  );

  const [open, setOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  // 2. دالة الانتقال لمتجر آخر
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null; // لا تظهر شيئاً حتى يتم التحميل
  }
  const onStoreSelect = (store: { value: string; label: string }) => {
    setOpen(false); // أغلق القائمة
    router.push(`/${store.value}`); // اذهب لصفحة المتجر المختار
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          role="combobox"
          aria-expanded={open}
          aria-label="Select a store"
          className={cn("w-[200px] justify-between", className)}>
          <StoreIcon className="mr-2 h-4 w-4" />
          {/* 3. عرض اسم المتجر الحالي */}
          {currentStore?.label}
          <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandList>
            <CommandInput placeholder="Search store..." />
            <CommandEmpty>No store found.</CommandEmpty>
            <CommandGroup heading="Stores">
              {/* 4. رسم قائمة المتاجر */}
              {formattedItems.map((store) => (
                <CommandItem
                  key={store.value}
                  onSelect={() => onStoreSelect(store)}
                  className="text-sm">
                  <StoreIcon className="mr-2 h-4 w-4" />
                  {store.label}
                  {/* علامة صح بجانب المتجر المختار */}
                  <Check
                    className={cn(
                      "ml-auto h-4 w-4",
                      currentStore?.value === store.value
                        ? "opacity-100"
                        : "opacity-0",
                    )}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
          <CommandSeparator />
          <CommandList>
            <CommandGroup>
              {/* 5. زر إنشاء متجر جديد */}
              <CommandItem
                onSelect={() => {
                  setOpen(false);
                  storeModal.onOpen(); // يفتح النافذة القديمة!
                }}>
                <PlusCircle className="mr-2 h-5 w-5" />
                Create Store
              </CommandItem>
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

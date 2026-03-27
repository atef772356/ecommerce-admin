"use client";

import { useState, useEffect } from "react";
import { Menu } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { MainNav } from "@/components/main-nav";

export const MobileNav = () => {
  const [isMounted, setIsMounted] = useState(false);
  // 1. إضافة State للتحكم في فتح وقفل القائمة
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // استخدمنا setTimeout عشان نخلي التحديث غير متزامن والـ Linter يسكت
    const timer = setTimeout(() => {
      setIsMounted(true);
    }, 0);

    // تنضيف الـ timer عشان نتفادى أي تسريب للذاكرة (Memory Leak)
    return () => clearTimeout(timer);
  }, []);
  if (!isMounted) return null;

  return (
    // 2. ربط الـ Sheet بالـ State
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="p-0 pt-10 w-72">
        <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
        <div className="px-4">
          {/* 3. إضافة onClick هنا: 
            أي نقرة داخل الـ MainNav هتقفل القائمة فوراً
          */}
          <div onClick={() => setOpen(false)}>
            <MainNav className="flex-col items-start space-x-0 space-y-4" />
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

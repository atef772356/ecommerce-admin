import { UserButton } from "@clerk/nextjs";
import { MainNav } from "@/components/main-nav";
import { MobileNav } from "@/components/mobile-nav"; // استيراد المكون الجديد

import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prismadb from "../../lib/prismadb";
import StoreSwitcher from "./store-switcher";
import { ThemeToggle } from "./theme-toggle";

const Navbar = async () => {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const stores = await prismadb.store.findMany({ where: { userId } });

  return (
    <div className="border-b">
      <div className="flex h-16 items-center px-4">
        <StoreSwitcher items={stores} />

        {/* الموبايل ناف يظهر فقط في الشاشات الصغيرة */}
        <MobileNav />

        {/* المين ناف يظهر فقط في الشاشات الكبيرة md:flex */}
        <MainNav className="mx-6 hidden md:flex" />

        <div className="ml-auto flex items-center space-x-4">
          <UserButton />
          <ThemeToggle />
        </div>
      </div>
    </div>
  );
};

export default Navbar;

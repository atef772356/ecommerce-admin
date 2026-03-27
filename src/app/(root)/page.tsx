"use client";

import { useEffect } from "react";
import { useStoreModal } from "@/hooks/use-store-modal";

const SetupPage = () => {
  const onOpen = useStoreModal((state) => state.onOpen);
  const isOpen = useStoreModal((state) => state.isOpen);

  useEffect(() => {
    if (!isOpen) {
      onOpen();
    }
  }, [isOpen, onOpen]);

  // بدل ما كنا بنعمل return null ويجيب شاشة بيضاء، هنحط الزرار ده
  return (
    <div className="flex flex-col items-center justify-center h-screen space-y-4">
      <h1 className="text-2xl font-bold">Welcome to the Dashboard!</h1>
      <p>If the setup modal open automatically, click the button below:</p>
      <button
        onClick={onOpen}
        className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800">
        Create a New Store
      </button>
    </div>
  );
};

export default SetupPage;

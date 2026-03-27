import { SignIn } from "@clerk/nextjs";

export default function Page() {
  return (
    <div className="text-red-500 text-2xl font-bold">
      <SignIn />
    </div>
  );
}

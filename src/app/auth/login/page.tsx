import { LoginForm } from "@/components/auth/login-form";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
export default async function Login() {
  const session = await auth();
  if (session?.user) return redirect("/dashboard");
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8 dark:bg-zinc-800">
      <LoginForm className="w-full max-w-md md:max-w-2xl" />
    </div>
  );
}

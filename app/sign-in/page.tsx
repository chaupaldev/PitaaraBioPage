"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInSchema } from "@/schemas/signInSchema";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";

// Import react-toastify toast and ToastContainer
import { toast, ToastContainer } from "react-toastify";

// Basic Input Component
function Input({ type = "text", ...props }: any) {
  return (
    <input
      type={type}
      className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      {...props}
    />
  );
}

// Basic Button Component
function Button({ children, ...props }: any) {
  return (
    <button
      className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
      {...props}
    >
      {children}
    </button>
  );
}

export default function Page() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Zod implementation
  const form = useForm<z.infer<typeof signInSchema>>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      identifier: "",
      password: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof signInSchema>) => {
    setIsSubmitting(true); // Start submitting
    try {
      const result = await signIn("credentials", {
        redirect: false,
        identifier: data.identifier,
        password: data.password,
      });
      console.log(result)
      if (result?.error) {
        toast.error("Incorrect username or password");
      }

      if (result?.url) {
        router.replace("/dashboard");
      }
    } catch (error) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false); // Stop submitting after completion
    }
  };

  return (
    <div className="flex justify-center items-center h-full my-6 sm:min-h-screen bg-transparent px-4 sm:px-6 md:px-8 py-4 sm:py-8 text-black">
      <div className="w-full max-w-md p-8 sm:space-y-8 bg-gray-200 rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-black mb-6">
            Login to your Dashbaord
          </h1>
        </div>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="mb-4">
            <label htmlFor="identifier" className="block text-xl font-semibold mb-2">
              Email
            </label>
            <Input
              id="identifier"
              type="text"
              placeholder="email/username"
              {...form.register("identifier")}
            />
            {form.formState.errors.identifier && (
              <span className="text-red-500 text-sm">{form.formState.errors.identifier?.message}</span>
            )}
          </div>
          <div className="mb-6">
            <label htmlFor="password" className="block text-xl font-semibold mb-2">
              Password
            </label>
            <Input
              id="password"
              type="password"
              placeholder="password"
              {...form.register("password")}
            />
            {form.formState.errors.password && (
              <span className="text-red-500 text-sm">{form.formState.errors.password?.message}</span>
            )}
          </div>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please Wait
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>
        
      </div>
      {/* ToastContainer to show toast notifications globally */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </div>
  );
}

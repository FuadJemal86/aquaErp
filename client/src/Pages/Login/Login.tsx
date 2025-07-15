import type React from "react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Droplets,
  Lock,
  Mail,
  User,
  Shield,
  Truck,
  Users,
  Package,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle,
  BarChart3,
} from "lucide-react";
import { toast } from "sonner";

// Form validation schema
const loginSchema = z.object({
  role: z.string().min(1, "Please select a role"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      role: "",
      email: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      console.log("Login data:", data);
      // Add your login logic here
      toast.success("Login successful!");
    } catch (error) {
      toast.error("Login failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const roleIcons = {
    admin: Shield,
    manager: BarChart3,
    cashier: Users,
    sales: Truck,
    delivery: Package,
    inventory: Package,
  };

  const features = [
    { icon: BarChart3, text: "Sales & Credit Management" },
    { icon: BarChart3, text: "Real-time Analytics " },
    { icon: Users, text: "Customer Management" },
    { icon: Package, text: "Product Inventory" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex">
      {/* Left Side - Branding & Features */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-3/5 flex-col justify-between p-12 text-white relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-20 w-72 h-72 bg-emerald-400 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400 rounded-full blur-3xl"></div>
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-4 mb-16">
            <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-cyan-400 rounded-xl flex items-center justify-center">
              <Droplets className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AquaERP</h1>
              <p className="text-emerald-200 text-sm">
                Enterprise Resource Planning
              </p>
            </div>
          </div>

          {/* Main Heading */}
          <div className="mb-12">
            <h2 className="text-5xl font-bold leading-tight mb-6">
              Streamline Your
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Product Distribution
              </span>
            </h2>
            <p className="text-xl text-slate-300 leading-relaxed">
              AquaERP - Complete ERP solution for water and soft drink
              distribution companies. Manage sales, credit, delivery, and
              customer tracking efficiently.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-2 gap-6">
            {features.map((feature, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-4 rounded-lg bg-white/5 backdrop-blur-sm border border-white/10"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-400/20 to-cyan-400/20 rounded-lg flex items-center justify-center">
                  <feature.icon className="w-5 h-5 text-emerald-400" />
                </div>
                <span className="font-medium">{feature.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Stats */}
        <div className="relative z-10 flex items-center gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">500+</div>
            <div className="text-sm text-slate-400">Active Businesses</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-cyan-400">99.9%</div>
            <div className="text-sm text-slate-400">Uptime</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-emerald-400">24/7</div>
            <div className="text-sm text-slate-400">Support</div>
          </div>
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 xl:w-2/5 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-xl mb-4">
              <Droplets className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">AquaERP</h1>
            <p className="text-slate-400 text-sm">
              Enterprise Resource Planning
            </p>
          </div>

          <Card className="shadow-2xl border-0 bg-white/95 backdrop-blur-sm">
            <CardHeader className="space-y-2 pb-8">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-2xl font-bold text-slate-900">
                    Welcome Back
                  </CardTitle>
                  <CardDescription className="text-slate-600 mt-1">
                    Sign in to access your dashboard
                  </CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              <Form {...form}>
                <form
                  onSubmit={form.handleSubmit(onSubmit)}
                  className="space-y-5"
                >
                  {/* Role Selection */}
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700 ">
                          Select Role
                        </FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="h-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500 w-full">
                              <div className="flex items-center gap-3">
                                <User className="w-4 h-4 text-slate-500" />
                                <SelectValue placeholder="Choose your role" />
                              </div>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="border-slate-200 min-w-[var(--radix-select-trigger-width)]">
                            <SelectItem value="admin" className="py-3">
                              <div className="flex items-center gap-3">
                                <Shield className="w-4 h-4 text-red-500" />
                                <div>
                                  <div className="font-medium">
                                    Administrator
                                  </div>
                                  <div className="text-xs text-slate-500">
                                    Full system access & management
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                            <SelectItem value="cashier" className="py-3">
                              <div className="flex items-center gap-3">
                                <Users className="w-4 h-4 text-blue-500" />
                                <div>
                                  <div className="font-medium">Cashier</div>
                                  <div className="text-xs text-slate-500">
                                    Sales, payments & credit management
                                  </div>
                                </div>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Email Input */}
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">
                          Email Address
                        </FormLabel>
                        <div className="relative">
                          <Mail className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                          <FormControl>
                            <Input
                              {...field}
                              type="email"
                              placeholder="Enter your email address"
                              className="h-12 pl-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                            />
                          </FormControl>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Password Input */}
                  <FormField
                    control={form.control}
                    name="password"
                    render={({ field }: { field: any }) => (
                      <FormItem>
                        <FormLabel className="text-sm font-semibold text-slate-700">
                          Password
                        </FormLabel>
                        <div className="relative">
                          <Lock className="absolute left-4 top-4 w-4 h-4 text-slate-400" />
                          <FormControl>
                            <Input
                              {...field}
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter your password"
                              className="h-12 pl-12 pr-12 border-slate-200 focus:border-emerald-500 focus:ring-emerald-500"
                            />
                          </FormControl>
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-4 text-slate-400 hover:text-slate-600"
                          >
                            {showPassword ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Remember Me & Forgot Password */}
                  <div className="flex items-center justify-between">
                    <FormField
                      control={form.control}
                      name="rememberMe"
                      render={({ field }: { field: any }) => (
                        <FormItem className="flex flex-row items-center space-x-2">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="border-slate-300"
                            />
                          </FormControl>
                          <FormLabel className="text-sm text-slate-600 cursor-pointer">
                            Remember me
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <button
                      type="button"
                      className="text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isLoading}
                    className="w-full h-12 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 group disabled:opacity-50"
                  >
                    {isLoading ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>Signing in...</span>
                      </div>
                    ) : (
                      <>
                        <span>Sign In to Dashboard</span>
                        <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </Button>
                </form>
              </Form>

              <Separator className="my-6" />
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="text-center mt-8 text-sm text-slate-400">
            <p>© 2024 AquaERP Systems. All rights reserved.</p>
            <div className="flex items-center justify-center gap-4 mt-2">
              <button className="hover:text-slate-300 transition-colors">
                Privacy Policy
              </button>
              <span>•</span>
              <button className="hover:text-slate-300 transition-colors">
                Terms of Service
              </button>
              <span>•</span>
              <button className="hover:text-slate-300 transition-colors">
                Support
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from "chart.js";
import { Doughnut, Line } from "react-chartjs-2";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  TrendingUp,
  TrendingDown,
  Users,
  ShoppingCart,
  DollarSign,
  Package,
  Building2,
  Wallet,
  BarChart3,
  PieChart as PieChartIcon,
  Activity,
  Eye,
  EyeOff,
  Calendar as CalendarIcon,
  Filter,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
// import api from "@/services/api";
// import { toast } from "sonner";

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

interface DashboardData {
  summary: {
    totalSales: number;
    totalSalesAmount: number;
    totalSalesQuantity: number;
    customerCount: number;
    profit: number;
    totalIncome: number;
    totalBuy: number;
    totalBuyQuantity: number;
  };
  balances: {
    cashBalance: number;
    totalBankBalance: number;
    bankBranches: Array<{
      branch: string;
      accountNumber: string;
      owner: string;
      balance: number;
    }>;
  };
  charts: {
    stockData: Array<{
      name: string;
      quantity: number;
      category: string;
    }>;
    monthlyProgress: Array<{
      month: string;
      sales: number;
      buy: number;
    }>;
  };
  recentTransactions: {
    sales: any[];
    buy: any[];
  };
}

const COLORS = [
  "#0088FE",
  "#00C49F",
  "#FFBB28",
  "#FF8042",
  "#8884D8",
  "#82CA9D",
  "#FFC658",
  "#FF6B6B",
];

// Dummy data
const dummyDashboardData: DashboardData = {
  summary: {
    totalSales: 1250,
    totalSalesAmount: 45000,
    totalSalesQuantity: 3200,
    customerCount: 85,
    profit: 12500,
    totalIncome: 75000,
    totalBuy: 890,
    totalBuyQuantity: 2800,
  },
  balances: {
    cashBalance: 25000,
    totalBankBalance: 50000,
    bankBranches: [
      {
        branch: "Commercial Bank of Ethiopia",
        accountNumber: "1000123456789",
        owner: "AquaERP Business",
        balance: 30000,
      },
      {
        branch: "Bank of Abyssinia",
        accountNumber: "2000987654321",
        owner: "AquaERP Business",
        balance: 20000,
      },
    ],
  },
  charts: {
    stockData: [
      { name: "Water Bottles", quantity: 500, category: "Beverages" },
      { name: "Soft Drinks", quantity: 300, category: "Beverages" },
      { name: "Juices", quantity: 200, category: "Beverages" },
      { name: "Energy Drinks", quantity: 150, category: "Beverages" },
      { name: "Mineral Water", quantity: 400, category: "Water" },
    ],
    monthlyProgress: [
      { month: "Jan", sales: 12000, buy: 8000 },
      { month: "Feb", sales: 15000, buy: 10000 },
      { month: "Mar", sales: 18000, buy: 12000 },
      { month: "Apr", sales: 22000, buy: 15000 },
      { month: "May", sales: 25000, buy: 18000 },
      { month: "Jun", sales: 28000, buy: 20000 },
      { month: "Jul", sales: 32000, buy: 22000 },
      { month: "Aug", sales: 35000, buy: 25000 },
      { month: "Sep", sales: 38000, buy: 28000 },
      { month: "Oct", sales: 42000, buy: 30000 },
      { month: "Nov", sales: 45000, buy: 32000 },
      { month: "Dec", sales: 48000, buy: 35000 },
    ],
  },
  recentTransactions: {
    sales: [
      {
        Product_type: { name: "Water Bottles" },
        Customer: { full_name: "John Doe" },
        price_per_quantity: 25,
        quantity: 10,
      },
      {
        Product_type: { name: "Soft Drinks" },
        Customer: { full_name: "Jane Smith" },
        price_per_quantity: 30,
        quantity: 5,
      },
      {
        Product_type: { name: "Energy Drinks" },
        Customer: { full_name: "Mike Johnson" },
        price_per_quantity: 40,
        quantity: 8,
      },
      {
        Product_type: { name: "Mineral Water" },
        Customer: { full_name: "Sarah Wilson" },
        price_per_quantity: 20,
        quantity: 15,
      },
    ],
    buy: [
      {
        Product_type: { name: "Water Bottles" },
        supplier_name: "Aqua Suppliers Ltd",
        total_money: 2000,
        quantity: 100,
      },
      {
        Product_type: { name: "Soft Drinks" },
        supplier_name: "Beverage Corp",
        total_money: 1500,
        quantity: 50,
      },
      {
        Product_type: { name: "Energy Drinks" },
        supplier_name: "Energy Plus Inc",
        total_money: 3200,
        quantity: 80,
      },
      {
        Product_type: { name: "Mineral Water" },
        supplier_name: "Pure Water Co",
        total_money: 1800,
        quantity: 90,
      },
    ],
  },
};

function AdminDashboard() {
  const [hiddenStates, setHiddenStates] = useState({
    profit: false,
    cashBalance: false,
    bankBalance: false,
    totalAssets: false,
  });

  // Filter states
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedFilter, setSelectedFilter] = useState<string>("all-time");

  const toggleVisibility = (cardType: keyof typeof hiddenStates) => {
    setHiddenStates((prev) => ({
      ...prev,
      [cardType]: !prev[cardType],
    }));
  };

  const formatValue = (value: number, isHidden: boolean) => {
    if (isHidden) {
      return "****";
    }
    return value.toLocaleString();
  };

  const dashboardData = dummyDashboardData;
  const { summary, balances, charts, recentTransactions } = dashboardData;

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your business performance
          </p>
        </div>

        {/* Filter Controls */}
        <div className="flex items-center gap-16 sm:gap-4">
          {/* Date Filter */}
          <div className="flex items-center gap-2 pl-3">
            <Label
              htmlFor="date-filter"
              className="hidden sm:block text-sm font-medium"
            >
              Date:
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-[140px] sm:w-[200px] justify-start text-left font-normal ",
                    !selectedDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className=" h-4 w-3" />
                  {selectedDate ? (
                    format(selectedDate, "PPP")
                  ) : (
                    <span>Pick a date</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={setSelectedDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Quick Filter Dropdown */}
          <div className="flex items-center gap-2">
            <Label
              htmlFor="quick-filter"
              className="hidden sm:block text-sm font-medium"
            >
              Filter:
            </Label>
            <Select value={selectedFilter} onValueChange={setSelectedFilter}>
              <SelectTrigger className="w-[120px] sm:w-[160px]">
                <SelectValue placeholder="Select filter" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-time">All Time</SelectItem>
                <SelectItem value="today">Today</SelectItem>
                <SelectItem value="yesterday">Yesterday</SelectItem>
                <SelectItem value="this-week">This Week</SelectItem>
                <SelectItem value="last-week">Last Week</SelectItem>
                <SelectItem value="this-month">This Month</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Summary Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Sales Report Card */}
        <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.totalSales.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              {summary.totalSalesQuantity} items sold
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              ${summary.totalSalesAmount.toLocaleString()}
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-green-400/20 to-green-600/20 rounded-bl-full" />
          </CardContent>
        </Card>

        {/* Customer Count Card */}
        <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Customers</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.customerCount.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              Total registered customers
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-blue-400/20 to-blue-600/20 rounded-bl-full" />
          </CardContent>
        </Card>

        {/* Profit Card */}
        <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">
                ${formatValue(summary.profit, hiddenStates.profit)}
              </div>
              <button
                onClick={() => toggleVisibility("profit")}
                className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-md transition-colors"
                title={hiddenStates.profit ? "Show value" : "Hide value"}
              >
                {hiddenStates.profit ? (
                  <EyeOff className="h-4 w-4 text-slate-500" />
                ) : (
                  <Eye className="h-4 w-4 text-slate-500" />
                )}
              </button>
            </div>
            <div className="flex items-center text-xs text-muted-foreground mt-1">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              This month's profit
            </div>
            <div className="text-xs text-green-500 mt-1">
              {summary.profit >= 0 ? "Positive" : "Negative"}
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-purple-400/20 to-purple-600/20 rounded-bl-full" />
          </CardContent>
        </Card>

        {/* Total Income Card */}
        <Card className="relative overflow-hidden hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Income</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summary.totalIncome.toLocaleString()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
              Cash + Bank balance
            </div>
            <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-orange-400/20 to-orange-600/20 rounded-bl-full" />
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Progress Line Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Monthly Progress
            </CardTitle>
            <CardDescription>
              Sales vs Buy transactions over time
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-80 w-full flex items-center justify-center">
              <div className="w-full h-full">
                <Line
                  data={{
                    labels: charts.monthlyProgress.map((item) => item.month),
                    datasets: [
                      {
                        label: "Sales",
                        data: charts.monthlyProgress.map((item) => item.sales),
                        borderColor: "#0088FE",
                        backgroundColor: "#0088FE",
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                      },
                      {
                        label: "Buy",
                        data: charts.monthlyProgress.map((item) => item.buy),
                        borderColor: "#FF8042",
                        backgroundColor: "#FF8042",
                        tension: 0.4,
                        pointRadius: 4,
                        pointHoverRadius: 6,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "top",
                        labels: {
                          usePointStyle: true,
                          padding: 15,
                          font: {
                            size: 12,
                          },
                        },
                      },
                      title: {
                        display: false,
                      },
                      tooltip: {
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        titleColor: "#ffffff",
                        bodyColor: "#ffffff",
                        borderColor: "#ffffff",
                        borderWidth: 1,
                        cornerRadius: 8,
                        callbacks: {
                          label: function (context: any) {
                            let label = context.dataset.label || "";
                            if (label) {
                              label += ": ";
                            }
                            if (context.parsed.y !== null) {
                              label += context.parsed.y.toLocaleString();
                            }
                            return label;
                          },
                        },
                      },
                    },
                    scales: {
                      x: {
                        grid: {
                          display: true,
                          color: "#f1f5f9",
                        },
                        ticks: {
                          font: {
                            size: 11,
                          },
                        },
                      },
                      y: {
                        grid: {
                          display: true,
                          color: "#f1f5f9",
                        },
                        ticks: {
                          font: {
                            size: 11,
                          },
                          callback: function (value: any) {
                            return value.toLocaleString();
                          },
                        },
                      },
                    },
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stock Quantities Doughnut Chart */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChartIcon className="h-5 w-5" />
              Product Stock
            </CardTitle>
            <CardDescription>
              Current stock quantities by product
            </CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="h-80 w-full flex items-center justify-center">
              <div className="w-full h-full max-w-md mx-auto">
                <Doughnut
                  data={{
                    labels: charts.stockData.map((item) => item.name),
                    datasets: [
                      {
                        label: "Quantity",
                        data: charts.stockData.map((item) => item.quantity),
                        backgroundColor: [
                          "#3B82F6", // Blue
                          "#10B981", // Green
                          "#F59E0B", // Yellow
                          "#EF4444", // Red
                          "#8B5CF6", // Purple
                        ],
                        borderColor: "#ffffff",
                        borderWidth: 2,
                        hoverBorderWidth: 3,
                      },
                    ],
                  }}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        position: "bottom",
                        labels: {
                          usePointStyle: true,
                          padding: 12,
                          font: {
                            size: 11,
                            weight: "normal",
                          },
                          color: "#374151",
                        },
                      },
                      tooltip: {
                        backgroundColor: "rgba(0, 0, 0, 0.8)",
                        titleColor: "#ffffff",
                        bodyColor: "#ffffff",
                        borderColor: "#ffffff",
                        borderWidth: 1,
                        cornerRadius: 8,
                        displayColors: true,
                        callbacks: {
                          label: function (context: any) {
                            const label = context.label || "";
                            const value = context.parsed;
                            const total = context.dataset.data.reduce(
                              (a: number, b: number) => a + b,
                              0
                            );
                            const percentage = ((value / total) * 100).toFixed(
                              1
                            );
                            return `${label}: ${value.toLocaleString()} (${percentage}%)`;
                          },
                        },
                      },
                    },
                    cutout: "55%",
                    radius: "85%",
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Balance Cards Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Building2 className="h-6 w-6" />
          Balance Overview
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Cash Balance */}
          <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-700 border-0 bg-gradient-to-br from-emerald-600 via-emerald-500 to-teal-400 dark:from-emerald-700 dark:via-emerald-600 dark:to-teal-500 transform hover:scale-105 hover:-rotate-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-400/20 via-transparent to-transparent" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-white font-semibold">
                <div className="p-3 bg-white/25 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg">
                  <Wallet className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold">Cash Balance</div>
                  <div className="text-xs text-emerald-100/80 font-medium">
                    Available cash
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
                  ${formatValue(balances.cashBalance, hiddenStates.cashBalance)}
                </div>
                <button
                  onClick={() => toggleVisibility("cashBalance")}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title={hiddenStates.cashBalance ? "Show value" : "Hide value"}
                >
                  {hiddenStates.cashBalance ? (
                    <EyeOff className="h-4 w-4 text-white" />
                  ) : (
                    <Eye className="h-4 w-4 text-white" />
                  )}
                </button>
              </div>
              <div className="flex items-center text-sm text-emerald-100 mb-3">
                <div className="p-1 bg-green-500/40 rounded-full mr-2">
                  <TrendingUp className="h-3 w-3 text-white" />
                </div>
                +5.2% from last week
              </div>
              <p className="text-sm text-emerald-100/90">
                Available cash on hand
              </p>
              <div className="absolute top-6 right-6 w-24 h-24 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-sm" />
              <div className="absolute bottom-6 left-6 w-16 h-16 bg-gradient-to-tr from-white/20 to-transparent rounded-full blur-sm" />
            </CardContent>
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Card>

          {/* Total Bank Balance */}
          <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-700 border-0 bg-gradient-to-br from-blue-600 via-indigo-500 to-purple-400 dark:from-blue-700 dark:via-indigo-600 dark:to-purple-500 transform hover:scale-105 hover:rotate-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-400/20 via-transparent to-transparent" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-white font-semibold">
                <div className="p-3 bg-white/25 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold">Total Bank Balance</div>
                  <div className="text-xs text-blue-100/80 font-medium">
                    Combined accounts
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
                  $
                  {formatValue(
                    balances.totalBankBalance,
                    hiddenStates.bankBalance
                  )}
                </div>
                <button
                  onClick={() => toggleVisibility("bankBalance")}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title={hiddenStates.bankBalance ? "Show value" : "Hide value"}
                >
                  {hiddenStates.bankBalance ? (
                    <EyeOff className="h-4 w-4 text-white" />
                  ) : (
                    <Eye className="h-4 w-4 text-white" />
                  )}
                </button>
              </div>
              <div className="flex items-center text-sm text-blue-100 mb-3">
                <div className="p-1 bg-blue-500/40 rounded-full mr-2">
                  <TrendingUp className="h-3 w-3 text-white" />
                </div>
                +12.8% from last month
              </div>
              <p className="text-sm text-blue-100/90">Combined bank accounts</p>
              <div className="absolute top-6 right-6 w-24 h-24 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-sm" />
              <div className="absolute bottom-6 left-6 w-16 h-16 bg-gradient-to-tr from-white/20 to-transparent rounded-full blur-sm" />
            </CardContent>
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Card>

          {/* Total Assets */}
          <Card className="group relative overflow-hidden hover:shadow-2xl transition-all duration-700 border-0 bg-gradient-to-br from-purple-600 via-pink-500 to-rose-400 dark:from-purple-700 dark:via-pink-600 dark:to-rose-500 transform hover:scale-105 hover:-rotate-1">
            <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-purple-400/20 via-transparent to-transparent" />
            <CardHeader className="relative z-10">
              <CardTitle className="flex items-center gap-3 text-white font-semibold">
                <div className="p-3 bg-white/25 rounded-xl backdrop-blur-sm border border-white/30 shadow-lg">
                  <DollarSign className="h-6 w-6 text-white" />
                </div>
                <div>
                  <div className="text-lg font-bold">Total Assets</div>
                  <div className="text-xs text-purple-100/80 font-medium">
                    Cash + Bank
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative z-10">
              <div className="flex items-center justify-between">
                <div className="text-4xl font-bold text-white mb-3 drop-shadow-lg">
                  $
                  {formatValue(
                    balances.cashBalance + balances.totalBankBalance,
                    hiddenStates.totalAssets
                  )}
                </div>
                <button
                  onClick={() => toggleVisibility("totalAssets")}
                  className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  title={hiddenStates.totalAssets ? "Show value" : "Hide value"}
                >
                  {hiddenStates.totalAssets ? (
                    <EyeOff className="h-4 w-4 text-white" />
                  ) : (
                    <Eye className="h-4 w-4 text-white" />
                  )}
                </button>
              </div>
              <div className="flex items-center text-sm text-purple-100 mb-3">
                <div className="p-1 bg-purple-500/40 rounded-full mr-2">
                  <TrendingUp className="h-3 w-3 text-white" />
                </div>
                +9.1% from last month
              </div>
              <p className="text-sm text-purple-100/90">Cash + Bank balance</p>
              <div className="absolute top-6 right-6 w-24 h-24 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-sm" />
              <div className="absolute bottom-6 left-6 w-16 h-16 bg-gradient-to-tr from-white/20 to-transparent rounded-full blur-sm" />
            </CardContent>
            <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          </Card>
        </div>

        {/* Bank Branch Details */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
            <Building2 className="h-5 w-5" />
            Bank Branch Balances
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {balances.bankBranches.map((bank, index) => (
              <Card
                key={index}
                className="group relative overflow-hidden hover:shadow-2xl transition-all duration-700 border-0 bg-gradient-to-br from-slate-600 via-slate-500 to-gray-400 dark:from-slate-700 dark:via-slate-600 dark:to-gray-500 transform hover:scale-105 hover:rotate-1"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent" />
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-slate-400/20 via-transparent to-transparent" />
                <CardHeader className="relative z-10">
                  <CardTitle className="flex items-center gap-2 text-white font-semibold">
                    <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                      <Building2 className="h-5 w-5 text-white" />
                    </div>
                    {bank.branch}
                  </CardTitle>
                </CardHeader>
                <CardContent className="relative z-10">
                  <div className="text-3xl font-bold text-white mb-2">
                    ${bank.balance.toLocaleString()}
                  </div>
                  <div className="flex items-center text-sm text-slate-100 mb-2">
                    <div className="p-1 bg-slate-500/30 rounded-full mr-2">
                      <TrendingUp className="h-3 w-3 text-white" />
                    </div>
                    Account: {bank.accountNumber}
                  </div>
                  <p className="text-sm text-slate-100/90">{bank.owner}</p>
                  <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-sm" />
                  <div className="absolute bottom-2 left-2 w-12 h-12 bg-gradient-to-tr from-white/20 to-transparent rounded-full blur-sm" />
                </CardContent>
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminDashboard;

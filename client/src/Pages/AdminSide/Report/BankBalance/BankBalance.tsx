import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Building2,
  DollarSign,
  TrendingUp,
  BanknoteIcon,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";
import api from "@/services/api";

interface BankBalanceData {
  id: number;
  balance: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  Bank_list: {
    id: number;
    branch: string;
    account_number: string;
    owner: string;
  };
}

function BankBalance() {
  const [bankBalances, setBankBalances] = useState<BankBalanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBankBalances = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await api.get("/admin/get-bank-balance");
      setBankBalances(response.data.bankBalances);
    } catch (err: any) {
      setError("Failed to fetch bank balances");
      console.error(err);
      toast.error(err.response?.data?.error || "Failed to fetch bank balances");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBankBalances();
  }, []);

  const getTotalBalance = () => {
    return bankBalances.reduce((total, bank) => total + bank.balance, 0);
  };

  const getAverageBalance = () => {
    if (bankBalances.length === 0) return 0;
    return getTotalBalance() / bankBalances.length;
  };

  const getBalanceStatus = (balance: number) => {
    if (balance > 100000) return "high";
    if (balance > 50000) return "medium";
    return "low";
  };

  const getBalanceColor = (balance: number) => {
    const status = getBalanceStatus(balance);
    switch (status) {
      case "high":
        return "text-green-600 bg-green-50 border-green-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getBalanceIcon = (balance: number) => {
    const status = getBalanceStatus(balance);
    switch (status) {
      case "high":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "medium":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "low":
        return <XCircle className="h-5 w-5 text-red-600" />;
      default:
        return <BanknoteIcon className="h-5 w-5 text-gray-600" />;
    }
  };

  if (error) {
    return (
      <Card className="border-destructive">
        <CardContent className="pt-6">
          <div className="text-center text-destructive">
            <h2 className="text-xl font-semibold mb-2">Error</h2>
            <p>{error}</p>
            <Button
              onClick={fetchBankBalances}
              className="mt-4"
              variant="outline"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bank Balance Report</h1>
          <p className="text-muted-foreground mt-1">
            Current balances across all bank branches
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Summary Cards */}
      {/* <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getTotalBalance().toLocaleString()} Birr
            </div>
            <p className="text-xs text-muted-foreground">Across all banks</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Banks</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{bankBalances.length}</div>
            <p className="text-xs text-muted-foreground">Bank branches</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Balance
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getAverageBalance().toFixed(0)} Birr
            </div>
            <p className="text-xs text-muted-foreground">Per bank branch</p>
          </CardContent>
        </Card>
      </div> */}

      {/* Bank Balance Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold"></h2>
          <Button
            onClick={fetchBankBalances}
            variant="outline"
            size="sm"
            disabled={loading}
          >
            Refresh
          </Button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={index} className="p-6">
                <div className="space-y-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-8 w-1/2" />
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-2/3" />
                </div>
              </Card>
            ))}
          </div>
        ) : bankBalances.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground">
                <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Bank Balances</h3>
                <p>No bank balance data available.</p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {bankBalances.map((bank) => (
              <Card
                key={bank.id}
                className={`transition-all duration-200 hover:shadow-lg hover:scale-105 `}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg font-semibold">
                      {bank.Bank_list.branch}
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-1">
                    <div className="text-3xl font-bold">
                      {bank.balance.toLocaleString()} Birr
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Account: {bank.Bank_list.account_number}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Owner:</span>
                      <span className="font-medium">
                        {bank.Bank_list.owner}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Status:</span>
                      <Badge
                        variant={bank.isActive ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {bank.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default BankBalance;

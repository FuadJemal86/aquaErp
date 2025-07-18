import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, DollarSign, TrendingUp } from "lucide-react";

interface CashTransactionData {
  id: number;
  in: number;
  out: number;
  balance: number;
  transaction_id: string;
  manager_name: string;
  casher_name: string;
  manager_id: number | null;
  casher_id: number | null;
  updatedAt: string;
}

interface CashTransactionSummaryProps {
  summaryData: CashTransactionData[];
}

function CashTransactionSummary({ summaryData }: CashTransactionSummaryProps) {
  // Summary calculations
  const getTotalCashTransactions = () => {
    return summaryData.length;
  };

  const getTotalCashMoney = () => {
    return summaryData.reduce((total, transaction) => {
      return total + transaction.in + transaction.out;
    }, 0);
  };

  const getAverageCashTransaction = () => {
    if (summaryData.length === 0) return 0;
    return getTotalCashMoney() / summaryData.length;
  };

  const getTotalCashIn = () => {
    return summaryData.reduce((total, transaction) => {
      return total + transaction.in;
    }, 0);
  };

  const getTotalCashOut = () => {
    return summaryData.reduce((total, transaction) => {
      return total + transaction.out;
    }, 0);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Total Transactions
          </CardTitle>
          <BarChart3 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getTotalCashTransactions()}</div>
          <p className="text-xs text-muted-foreground">All cash transactions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Cash Flow</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {getTotalCashMoney().toLocaleString()} Birr
          </div>
          <p className="text-xs text-muted-foreground">Total cash movement</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            Average Transaction
          </CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {getAverageCashTransaction().toFixed(0)} Birr
          </div>
          <p className="text-xs text-muted-foreground">Per transaction</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Cash Balance</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {(getTotalCashIn() - getTotalCashOut()).toLocaleString()} Birr
          </div>
          <p className="text-xs text-muted-foreground">Net cash position</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default CashTransactionSummary;

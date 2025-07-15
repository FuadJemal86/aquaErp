import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, DollarSign, TrendingUp, Building2 } from "lucide-react";

interface BankTransactionData {
  id: number;
  in: number;
  out: number;
  balance: number;
  transaction_id: string;
  description: string | null;
  receipt_image: string | null;
  createdAt: string;
  Bank_list: {
    id: number;
    branch: string;
    account_number: string;
  };
}

interface BankTransactionSummaryProps {
  summaryData: BankTransactionData[];
}

function BankTransactionSummary({ summaryData }: BankTransactionSummaryProps) {
  // Summary calculations
  const getTotalBankTransactions = () => {
    return summaryData.length;
  };

  const getTotalBankMoney = () => {
    return summaryData.reduce((total, transaction) => {
      return total + transaction.in + transaction.out;
    }, 0);
  };

  const getAverageBankTransaction = () => {
    if (summaryData.length === 0) return 0;
    return getTotalBankMoney() / summaryData.length;
  };

  const getTotalBankIn = () => {
    return summaryData.reduce((total, transaction) => {
      return total + transaction.in;
    }, 0);
  };

  const getTotalBankOut = () => {
    return summaryData.reduce((total, transaction) => {
      return total + transaction.out;
    }, 0);
  };

  const getUniqueBanks = () => {
    const uniqueBanks = new Set(
      summaryData.map((transaction) => transaction.Bank_list.branch)
    );
    return uniqueBanks.size;
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
          <div className="text-2xl font-bold">{getTotalBankTransactions()}</div>
          <p className="text-xs text-muted-foreground">All bank transactions</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Bank Flow</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {getTotalBankMoney().toLocaleString()} Birr
          </div>
          <p className="text-xs text-muted-foreground">Total bank movement</p>
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
            {getAverageBankTransaction().toFixed(0)} Birr
          </div>
          <p className="text-xs text-muted-foreground">Per transaction</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Banks</CardTitle>
          <Building2 className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{getUniqueBanks()}</div>
          <p className="text-xs text-muted-foreground">Bank branches used</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default BankTransactionSummary;

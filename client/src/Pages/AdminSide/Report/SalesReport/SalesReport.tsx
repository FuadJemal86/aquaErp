import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, DollarSign, TrendingUp } from "lucide-react";
import { useState } from "react";
import SalesReportTable from "./components/SalesReportTable";
import ShowDetails from "./components/ShowDetails";

interface SalesData {
  id: number;
  type_id: number;
  bank_id: number | null;
  customer_id: number | null;
  walker_id: string | null;
  transaction_id: string;
  price_per_quantity: number;
  quantity: number;
  payment_method: "CASH" | "BANK" | "CREDIT";
  customer_type: "REGULAR" | "WALKER";
  status: string;
  createdAt: string;
  updatedAt: string;
  Product_type: {
    id: number;
    name: string;
  };
  Bank_list: {
    id: number;
    branch: string;
  } | null;
  Customer: {
    id: number;
    full_name: string;
  } | null;
}

function SalesReport() {
  const [summaryData, setSummaryData] = useState<SalesData[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const calculateTotal = (price: number, quantity: number) => {
    return price * quantity;
  };

  const getTotalSales = () => {
    return summaryData.reduce((total, sale) => {
      return total + calculateTotal(sale.price_per_quantity, sale.quantity);
    }, 0);
  };

  const getTotalTransactions = () => {
    return summaryData.length;
  };

  const handleViewDetails = (transactionId: string) => {
    setSelectedTransaction(transactionId);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => {
    setShowDetailsModal(false);
    setSelectedTransaction(null);
  };

  const handleDataChange = (data: SalesData[]) => {
    setSummaryData(data);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Sales Report</h1>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${getTotalSales().toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              From {getTotalTransactions()} transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Transactions
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getTotalTransactions()}</div>
            <p className="text-xs text-muted-foreground">
              All time transactions
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Average Order Value
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              $
              {getTotalTransactions() > 0
                ? (getTotalSales() / getTotalTransactions()).toFixed(2)
                : "0"}
            </div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Sales Table */}
      <SalesReportTable
        onViewDetails={handleViewDetails}
        onDataChange={handleDataChange}
      />

      {/* Show Details Modal */}
      {selectedTransaction && (
        <ShowDetails
          transactionId={selectedTransaction}
          isOpen={showDetailsModal}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
}

export default SalesReport;

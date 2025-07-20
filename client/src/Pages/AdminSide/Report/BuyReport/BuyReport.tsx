import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, ShoppingCart, TrendingDown } from "lucide-react";
import { useState } from "react";
import BuyReportTable from "./components/BuyReportTable";
import ShowBuyDetails from "./components/ShowDetail";

interface BuyData {
  id: number;
  type_id: number;
  bank_id: number | null;
  transaction_id: string;
  price_per_quantity: number;
  quantity: number;
  payment_method: "CASH" | "BANK" | "CREDIT";
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
  supplier_name: string;
}

function BuyReport() {
  const [summaryData, setSummaryData] = useState<BuyData[]>([]);
  const [selectedTransaction, setSelectedTransaction] = useState<string | null>(
    null
  );
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const calculateTotal = (price: number, quantity: number) => {
    return price * quantity;
  };

  const getTotalPurchases = () => {
    return summaryData.reduce((total, purchase) => {
      return (
        total + calculateTotal(purchase.price_per_quantity, purchase.quantity)
      );
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

  const handleDataChange = (data: BuyData[]) => {
    setSummaryData(data);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Purchase Report</h1>
        <div className="text-sm text-muted-foreground">
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Purchases
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getTotalPurchases().toLocaleString()} Birr
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
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getTotalTransactions() > 0
                ? (
                    getTotalPurchases() / getTotalTransactions()
                  ).toLocaleString()
                : "0"}{" "}
              Birr
            </div>
            <p className="text-xs text-muted-foreground">Per transaction</p>
          </CardContent>
        </Card>
      </div>

      {/* Buy Table */}
      <BuyReportTable
        onViewDetails={handleViewDetails}
        onDataChange={handleDataChange}
      />

      {/* Show Details Modal */}
      {selectedTransaction && (
        <ShowBuyDetails
          transactionId={selectedTransaction}
          isOpen={showDetailsModal}
          onClose={handleCloseDetails}
        />
      )}
    </div>
  );
}

export default BuyReport;

import { Button } from "@/components/ui/button";
import api from "@/services/api";
import { Loader2, ReceiptText, User, Users, XCircle } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import NotificationModal from "./NotificationModal";

function ConfirmSellModal({
  open,
  onClose,
  cartList,
  customerType,
  paymentMethod,
  selectedCustomer,
  categories,
  productTypes,
  totalAmount,
  bankList,
}: {
  open: boolean;
  onClose: () => void;
  cartList: any[];
  customerType: string;
  paymentMethod: string;
  selectedCustomer: any;
  categories: any[];
  productTypes: any[];
  totalAmount: number;
  bankList: any[];
}) {
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  if (!open) return null;

  // Helper functions
  const getCategoryName = (typeId: number) => {
    const type = productTypes.find((t) => t.id === typeId);
    if (!type) return "-";
    const cat = categories.find((c) => c.id === type.product_category_id);
    return cat ? cat.name : "-";
  };

  const getTypeName = (typeId: number) => {
    const type = productTypes.find((t) => t.id === typeId);
    return type ? type.name : "-";
  };

  // Get customer info
  const getCustomerInfo = () => {
    if (customerType === "WALKER") {
      return "Walking Customer";
    } else if (selectedCustomer) {
      return `${selectedCustomer.full_name} (${selectedCustomer.phone})`;
    }
    return "Regular Customer";
  };

  // Get bank info
  let bankInfo = null;
  if (paymentMethod === "BANK" && cartList.length > 0) {
    const bankId = cartList[0].bank_id;
    const bank = bankList.find((b) => b.id === bankId);
    if (bank) {
      bankInfo = `${bank.branch} - ${bank.account_number} (${bank.owner})`;
    }
  }

  // Get credit info
  let creditReturnDate = null;
  let creditDescription = null;
  if (paymentMethod === "CREDIT" && cartList.length > 0) {
    creditReturnDate = cartList[0].return_date || null;
    creditDescription = cartList[0].description || null;
  }

  const formatDate = (date: string) => {
    const dateObj = new Date(date);
    return dateObj.toISOString().split("T")[0];
  };

  const handleConfirm = async () => {
    setIsLoading(true);
    setErrorMessage("");
    setShowSuccess(false);

    try {
      console.log(cartList);
      const cartListData = cartList.map((cart) => ({
        type_id: cart.type_id,
        quantity: cart.quantity,
        price: cart.price,
      }));

      const sendData = {
        customer_type: customerType,
        customer_id: selectedCustomer?.id || null,
        payment_method: paymentMethod,
        bank_id: paymentMethod === "BANK" ? cartList[0]?.bank_id : null,
        return_date:
          paymentMethod === "CREDIT"
            ? formatDate(cartList[0]?.return_date)
            : null,
        description:
          paymentMethod === "CREDIT" ? cartList[0]?.description : null,
        cart_list: cartListData,
      };

      console.log(sendData);
      const res = await api.post("/admin/sell-product", sendData);
      if (res.status === 200) {
        setShowSuccess(true);

        // Refresh page after 2 seconds
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      } else {
        setErrorMessage(res.data.message || "An error occurred");
        toast.error(res.data.message || "An error occurred");
      }
    } catch (error: any) {
      const errorMsg =
        error.response?.data?.message || "Network error occurred";
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Success Notification Modal */}
      <NotificationModal
        open={showSuccess}
        type="success"
        title="Sale Successful!"
        message="Your sale has been completed successfully."
      />

      {/* Main Confirmation Modal - Only show when not showing success */}
      {!showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-sm"
            onClick={onClose}
          />
          {/* Paper Invoice Box */}
          <div className="relative bg-card text-card-foreground rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-0 flex flex-col animate-fade-in border border-border dark:bg-card dark:text-card-foreground">
            {/* Invoice Header */}
            <div className="flex flex-col items-center gap-1 pt-8 pb-4 px-8 border-b border-dashed border-border bg-white dark:bg-card rounded-t-xl">
              <div className="flex items-center gap-2 mb-1">
                <ReceiptText className="h-7 w-7 text-primary" />
                <span className="text-2xl font-extrabold tracking-widest text-gray-800 dark:text-card-foreground uppercase">
                  Sales Receipt
                </span>
              </div>
              <span className="text-gray-500 dark:text-gray-300 text-xs tracking-wide">
                Please review your cart and payment details before confirming.
              </span>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="px-8 pt-4">
                <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <span className="text-red-700 dark:text-red-300 text-sm">
                    {errorMessage}
                  </span>
                </div>
              </div>
            )}

            {/* Info Section */}
            <div className="px-8 pt-4 pb-2 flex flex-col gap-1 text-base bg-white dark:bg-card">
              <div className="flex items-center gap-2">
                {customerType === "WALKER" ? (
                  <User className="h-4 w-4 text-gray-600" />
                ) : (
                  <Users className="h-4 w-4 text-gray-600" />
                )}
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  Customer:
                </span>{" "}
                <span className="text-gray-900 dark:text-gray-100">
                  {getCustomerInfo()}
                </span>
              </div>
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  Payment Method:
                </span>{" "}
                <span className="capitalize text-gray-900 dark:text-gray-100">
                  {paymentMethod}
                </span>
              </div>
              {paymentMethod === "BANK" && bankInfo && (
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                    Bank:
                  </span>{" "}
                  <span className="text-gray-900 dark:text-gray-100">
                    {bankInfo}
                  </span>
                </div>
              )}
              {paymentMethod === "CREDIT" && creditReturnDate && (
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                    Return Date:
                  </span>{" "}
                  <span className="text-gray-900 dark:text-gray-100">
                    {creditReturnDate}
                  </span>
                </div>
              )}
              {paymentMethod === "CREDIT" && creditDescription && (
                <div>
                  <span className="font-semibold text-gray-700 dark:text-gray-200">
                    Description:
                  </span>{" "}
                  <span className="text-gray-900 dark:text-gray-100">
                    {creditDescription}
                  </span>
                </div>
              )}
              <div>
                <span className="font-semibold text-gray-700 dark:text-gray-200">
                  Total Amount:
                </span>{" "}
                <span className="text-gray-900 dark:text-gray-100">
                  {totalAmount.toFixed(2)} Birr
                </span>
              </div>
            </div>
            <div className="border-b border-dashed border-border mx-8 my-2" />
            {/* Table Section */}
            <div className="px-4 md:px-8 py-2 flex-1 overflow-x-auto max-h-64 bg-white dark:bg-card">
              <table className="w-full text-sm font-mono border-separate border-spacing-y-1">
                <thead>
                  <tr className="bg-gray-100 dark:bg-muted">
                    <th className="p-2 text-left font-semibold">#</th>
                    <th className="p-2 text-left font-semibold">
                      Product Category
                    </th>
                    <th className="p-2 text-left font-semibold">
                      Product Type
                    </th>
                    <th className="p-2 text-center font-semibold">Qty</th>
                    <th className="p-2 text-center font-semibold">Price</th>
                    <th className="p-2 text-center font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {cartList.map((cart, idx) => (
                    <tr
                      key={cart.id}
                      className={
                        idx % 2 === 0
                          ? "bg-gray-50 dark:bg-muted/50"
                          : "bg-white dark:bg-background"
                      }
                    >
                      <td className="p-2 text-left">{idx + 1}</td>
                      <td className="p-2 text-left">
                        {getCategoryName(cart.type_id)}
                      </td>
                      <td className="p-2 text-left">
                        {getTypeName(cart.type_id)}
                      </td>
                      <td className="p-2 text-center">{cart.quantity}</td>
                      <td className="p-2 text-center">{cart.price}</td>
                      <td className="p-2 text-center">{cart.total_money}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-b border-dashed border-border mx-8 my-2" />
            {/* Thank You Note */}
            <div className="px-8 pt-2 pb-1 text-center text-gray-600 dark:text-gray-300 text-xs font-mono tracking-wide">
              Thank you for your purchase!
            </div>
            {/* Footer Buttons */}
            <div className="flex justify-end gap-3 px-8 py-4 border-t border-border bg-gray-50 dark:bg-muted rounded-b-xl">
              <Button
                variant="outline"
                onClick={onClose}
                className="min-w-[100px]"
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button
                onClick={handleConfirm}
                className="min-w-[100px] bg-green-500"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Confirm"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ConfirmSellModal;

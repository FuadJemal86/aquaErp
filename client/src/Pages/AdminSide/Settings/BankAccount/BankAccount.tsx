import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";

import { Edit, Trash2, Plus, Building2, CreditCard } from "lucide-react";
import api from "@/services/api";
import { z } from "zod";

interface BankAccount {
  id: number;
  branch: string;
  account_number: string;
  owner: string;
  createdAt: string;
  updatedAt: string;
}

const bankAccountSchema = z.object({
  branch: z.string().min(1, "Branch name is required"),
  account_number: z.string().min(1, "Account number is required"),
  owner: z.string().min(1, "Owner name is required"),
  balance: z.string().min(1, "Balance is required").refine((val) => !isNaN(Number(val)) && Number(val) >= 0, {
    message: "Balance must be a valid positive number"
  })
});

function BankAccount() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<BankAccount | null>(null);

  // Form states
  const [branch, setBranch] = useState("");
  const [account_number, setAccountNumber] = useState("");
  const [owner, setOwner] = useState("");
  const [balance, setBalance] = useState("");

  // Error states
  const [errors, setErrors] = useState<{
    branch?: string;
    account_number?: string;
    owner?: string;
    balance?: string;
  }>({});

  // Fetch bank accounts on component mount
  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/admin/get-bank-list");
      setBankAccounts(response.data || []);
    } catch (error: any) {
      console.error("Failed to fetch bank accounts:", error);
      toast.error(error.response?.data?.error || "Failed to fetch bank accounts");
    } finally {
      setIsLoading(false);
    }
  };

  const validateForm = () => {
    const newErrors: typeof errors = {};

    if (!branch.trim()) {
      newErrors.branch = "Branch name is required";
    }

    if (!account_number.trim()) {
      newErrors.account_number = "Account number is required";
    }

    if (!owner.trim()) {
      newErrors.owner = "Owner name is required";
    }

    if (!balance.trim()) {
      newErrors.balance = "Balance is required";
    } else if (isNaN(Number(balance)) || Number(balance) < 0) {
      newErrors.balance = "Balance must be a valid positive number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateUpdateForm = (): boolean => {
    const newErrors: typeof errors = {};

    if (!branch.trim()) {
      newErrors.branch = "Branch name is required";
    }

    if (!account_number.trim()) {
      newErrors.account_number = "Account number is required";
    }

    if (!owner.trim()) {
      newErrors.owner = "Owner name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddBankAccount = async (): Promise<void> => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.post("/admin/add-bank-list", {
        branch: branch.trim(),
        account_number: account_number.trim(),
        owner: owner.trim(),
        balance: balance.trim()
      });

      if (response.data.status || response.status === 201) {
        toast.success("Bank account created successfully");
        fetchBankAccounts();
        // Reset form
        setBranch("");
        setAccountNumber("");
        setOwner("");
        setBalance("");
        setErrors({});
      } else {
        toast.error("Failed to create bank account");
      }
    } catch (error: any) {
      console.error("Error creating bank account:", error);
      toast.error(error.response?.data?.error || "Failed to create bank account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (account: BankAccount): void => {
    setEditingId(account.id);
    setBranch(account.branch);
    setAccountNumber(account.account_number);
    setOwner(account.owner);
    setBalance("");
    setErrors({});
  };

  const handleUpdate = async (): Promise<void> => {
    if (!validateUpdateForm()) {
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.put(`/admin/edit-bank-list/${editingId}`, {
        branch: branch.trim(),
        account_number: account_number.trim(),
        owner: owner.trim(),
      });

      if (response.data.status || response.status === 200) {
        toast.success("Bank account updated successfully");
        fetchBankAccounts();
        handleCancel();
      } else {
        toast.error("Failed to update bank account");
      }
    } catch (error: any) {
      console.error("Error updating bank account:", error);
      toast.error(error.response?.data?.error || "Failed to update bank account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClick = (account: BankAccount): void => {
    setAccountToDelete(account);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async (): Promise<void> => {
    if (!accountToDelete) return;

    try {
      setIsLoading(true);
      const response = await api.put(`/admin/delete-bank-list/${accountToDelete.id}`);

      if (response.data.status || response.status === 200) {
        toast.success("Bank account deleted successfully");
        fetchBankAccounts();
      } else {
        toast.error("Failed to delete bank account");
      }
    } catch (error: any) {
      console.error("Error deleting bank account:", error);
      toast.error(error.response?.data?.error || "Failed to delete bank account");
    } finally {
      setIsLoading(false);
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    }
  };

  const handleCancel = (): void => {
    setEditingId(null);
    setBranch("");
    setAccountNumber("");
    setOwner("");
    setBalance("");
    setErrors({});
  };

  const clearFieldError = (field: string): void => {
    if (errors[field as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Building2 className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Bank Account Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add/Edit Bank Account */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              {editingId ? "Edit Bank Account" : "Add New Bank Account"}
            </CardTitle>
            <CardDescription>
              {editingId
                ? "Update the bank account information below"
                : "Add a new bank account with the required details"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="branch">Branch Name</Label>
              <Input
                id="branch"
                placeholder="Enter branch name"
                value={branch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setBranch(e.target.value);
                  clearFieldError('branch');
                }}
                disabled={isLoading}
                className={errors.branch ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {errors.branch && (
                <p className="text-sm text-red-600 mt-1">{errors.branch}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number</Label>
              <Input
                id="account_number"
                placeholder="Enter account number"
                value={account_number}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setAccountNumber(e.target.value);
                  clearFieldError('account_number');
                }}
                disabled={isLoading}
                className={errors.account_number ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {errors.account_number && (
                <p className="text-sm text-red-600 mt-1">{errors.account_number}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner">Account Holder Name</Label>
              <Input
                id="owner"
                placeholder="Enter holder name"
                value={owner}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                  setOwner(e.target.value);
                  clearFieldError('owner');
                }}
                disabled={isLoading}
                className={errors.owner ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
              />
              {errors.owner && (
                <p className="text-sm text-red-600 mt-1">{errors.owner}</p>
              )}
            </div>
            {!editingId && (
              <div className="space-y-2">
                <Label htmlFor="balance">Current Balance</Label>
                <Input
                  id="balance"
                  type="number"
                  placeholder="0.00"
                  value={balance}
                  onChange={(e) => {
                    setBalance(e.target.value);
                    clearFieldError('balance');
                  }}
                  disabled={isLoading}
                  className={errors.balance ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""}
                />
                {errors.balance && (
                  <p className="text-sm text-red-600 mt-1">{errors.balance}</p>
                )}
              </div>
            )}
            <div className="flex gap-2">
              {editingId ? (
                <>
                  <Button
                    onClick={handleUpdate}
                    className="flex-1"
                    disabled={isLoading}
                  >
                    {isLoading ? "Updating..." : "Update Account"}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={isLoading}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleAddBankAccount}
                  className="w-full"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    "Adding..."
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add Bank Account
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bank Accounts List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Bank Accounts ({bankAccounts.length})
            </CardTitle>
            <CardDescription>
              Manage your bank accounts with edit and delete actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading && bankAccounts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                Loading bank accounts...
              </div>
            ) : bankAccounts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No bank accounts found. Add your first account using the form.
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Branch</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Account Number</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Holder Name</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-900">Created</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-gray-900">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {bankAccounts.map((account) => (
                      <tr key={account.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3 text-sm font-medium text-gray-900">
                          {account.branch}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-700">{account.account_number}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">{account.owner}</td>
                        <td className="px-4 py-3 text-sm text-gray-700">
                          {new Date(account.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(account)}
                              disabled={isLoading}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDeleteClick(account)}
                              disabled={isLoading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>


      {/* Delete Bank Account Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Custom Tailwind Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteDialogOpen(false)}
          />

          {/* Inner Content using shadcn/ui */}
          <div className="relative bg-white border border-gray-200 shadow-2xl rounded-xl overflow-hidden max-w-md w-full mx-4">
            <div className="p-6">
              <div className="text-center mb-4">
                <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                  <Trash2 className="h-8 w-8 text-red-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">
                  Delete Bank Account
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  This action cannot be undone. This will permanently delete the bank account:
                </p>
              </div>

              <div className="flex gap-3 pt-0">
                <Button
                  variant="outline"
                  className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300 rounded-lg py-2.5 font-medium transition-colors"
                  onClick={() => setDeleteDialogOpen(false)}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDeleteConfirm}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white rounded-lg py-2.5 font-medium transition-colors shadow-lg hover:shadow-xl transform hover:scale-105"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Deleting...
                    </div>
                  ) : (
                    "Delete Account"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default BankAccount;
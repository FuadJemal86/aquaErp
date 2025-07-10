import React, { useState, useEffect, type JSX } from "react";
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
  balance: z.string().optional()
});

function BankAccount(): JSX.Element {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form states
  const [branch, setBranch] = useState("");
  const [account_number, setAccountNumber] = useState("");
  const [owner, setOwner] = useState("");
  const [balance, setBalance] = useState("");

  // Fetch bank accounts on component mount
  useEffect(() => {
    fetchBankAccounts();
  }, []);

  const fetchBankAccounts = async (): Promise<void> => {
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

  const handleAddBankAccount = async (): Promise<void> => {
    try {
      // Validate the input data
      const validatedData = bankAccountSchema.parse({
        branch: branch.trim(),
        account_number: account_number.trim(),
        owner: owner.trim(),
        balance: balance.trim()
      });

      setIsLoading(true);
      const response = await api.post("/admin/add-bank-list", validatedData);

      if (response.data.status || response.status === 200) {
        toast.success("Bank account created successfully");
        fetchBankAccounts();
        // Reset form
        setBranch("");
        setAccountNumber("");
        setOwner("");
        setBalance("");
      } else {
        toast.error("Failed to create bank account");
      }
    } catch (error: any) {
      console.error("Error creating bank account:", error);
      if (error instanceof z.ZodError) {
        // Handle Zod validation errors
        toast.error(error.errors[0].message);
      } else {
        toast.error(error.response?.data?.error || "Failed to create bank account");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (account: BankAccount): void => {
    setEditingId(account.id);
    setBranch(account.branch);
    setAccountNumber(account.account_number);
    setOwner(account.owner);
  };

  const handleUpdate = async (): Promise<void> => {
    if (!editingId || !branch.trim() || !account_number.trim() || !owner.trim()) {
      alert("Please fill all fields");
      return;
    }

    try {
      setIsLoading(true);
      const response = await api.put(`/admin/update-bank-list/${editingId}`, {
        branch: branch.trim(),
        account_number: account_number.trim(),
        owner: owner.trim(),
      });

      if (response.data.status || response.status === 200) {
        alert("Bank account updated successfully");
        fetchBankAccounts();
        handleCancel();
      } else {
        alert("Failed to update bank account");
      }
    } catch (error) {
      console.error("Error updating bank account:", error);
      alert("Failed to update bank account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number): Promise<void> => {
    try {
      setIsLoading(true);
      const response = await api.delete(`/admin/delete-bank-list/${id}`);

      if (response.data.status || response.status === 200) {
        alert("Bank account deleted successfully");
        fetchBankAccounts();
      } else {
        alert("Failed to delete bank account");
      }
    } catch (error) {
      console.error("Error deleting bank account:", error);
      alert("Failed to delete bank account");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = (): void => {
    setEditingId(null);
    setBranch("");
    setAccountNumber("");
    setOwner("");
    setBalance("");
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setBranch(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="account_number">Account Number</Label>
              <Input
                id="account_number"
                placeholder="Enter account number"
                value={account_number}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setAccountNumber(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="owner">Account Holder Name</Label>
              <Input
                id="owner"
                placeholder="Enter holder name"
                value={owner}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setOwner(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="balance">Current Balance</Label>
              <Input
                id="balance"
                type="number"
                placeholder="0.00"
                value={balance}
                onChange={(e) => setBalance(e.target.value)}
                disabled={isLoading}
              />
            </div>
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
                              onClick={() => handleDelete(account.id)}
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
    </div>
  );
}

export default BankAccount;
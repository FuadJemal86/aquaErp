import React, { useState } from "react";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Edit, Trash2, Plus, Building2, CreditCard } from "lucide-react";

interface BankAccount {
  id: string;
  branchName: string;
  accountNumber: string;
  holderName: string;
  currentBalance: number;
}

function BankAccount() {
  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form states
  const [branchName, setBranchName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [holderName, setHolderName] = useState("");
  const [currentBalance, setCurrentBalance] = useState("");

  const handleAddBankAccount = () => {
    if (
      branchName.trim() &&
      accountNumber.trim() &&
      holderName.trim() &&
      currentBalance
    ) {
      const newAccount: BankAccount = {
        id: Date.now().toString(),
        branchName: branchName.trim(),
        accountNumber: accountNumber.trim(),
        holderName: holderName.trim(),
        currentBalance: parseFloat(currentBalance),
      };
      setBankAccounts([...bankAccounts, newAccount]);
      // Reset form
      setBranchName("");
      setAccountNumber("");
      setHolderName("");
      setCurrentBalance("");
    }
  };

  const handleEdit = (account: BankAccount) => {
    setEditingId(account.id);
    setBranchName(account.branchName);
    setAccountNumber(account.accountNumber);
    setHolderName(account.holderName);
    setCurrentBalance(account.currentBalance.toString());
  };

  const handleUpdate = () => {
    if (
      editingId &&
      branchName.trim() &&
      accountNumber.trim() &&
      holderName.trim() &&
      currentBalance
    ) {
      setBankAccounts((accounts) =>
        accounts.map((account) =>
          account.id === editingId
            ? {
                ...account,
                branchName: branchName.trim(),
                accountNumber: accountNumber.trim(),
                holderName: holderName.trim(),
                currentBalance: parseFloat(currentBalance),
              }
            : account
        )
      );
      // Reset form
      setEditingId(null);
      setBranchName("");
      setAccountNumber("");
      setHolderName("");
      setCurrentBalance("");
    }
  };

  const handleDelete = (id: string) => {
    setBankAccounts((accounts) =>
      accounts.filter((account) => account.id !== id)
    );
  };

  const handleCancel = () => {
    setEditingId(null);
    setBranchName("");
    setAccountNumber("");
    setHolderName("");
    setCurrentBalance("");
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
              <Label htmlFor="branchName">Branch Name</Label>
              <Input
                id="branchName"
                placeholder="Enter branch name"
                value={branchName}
                onChange={(e) => setBranchName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="accountNumber">Account Number</Label>
              <Input
                id="accountNumber"
                placeholder="Enter account number"
                value={accountNumber}
                onChange={(e) => setAccountNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="holderName">Account Holder Name</Label>
              <Input
                id="holderName"
                placeholder="Enter holder name"
                value={holderName}
                onChange={(e) => setHolderName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentBalance">Current Balance</Label>
              <Input
                id="currentBalance"
                type="number"
                placeholder="0.00"
                value={currentBalance}
                onChange={(e) => setCurrentBalance(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              {editingId ? (
                <>
                  <Button onClick={handleUpdate} className="flex-1">
                    Update Account
                  </Button>
                  <Button onClick={handleCancel} variant="outline">
                    Cancel
                  </Button>
                </>
              ) : (
                <Button onClick={handleAddBankAccount} className="w-full">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Bank Account
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
            {bankAccounts.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No bank accounts found. Add your first account using the form.
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Branch</TableHead>
                      <TableHead>Account Number</TableHead>
                      <TableHead>Holder Name</TableHead>
                      <TableHead>Balance</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bankAccounts.map((account) => (
                      <TableRow key={account.id}>
                        <TableCell className="font-medium">
                          {account.branchName}
                        </TableCell>
                        <TableCell>{account.accountNumber}</TableCell>
                        <TableCell>{account.holderName}</TableCell>
                        <TableCell>
                          ${account.currentBalance.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(account)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(account.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default BankAccount;

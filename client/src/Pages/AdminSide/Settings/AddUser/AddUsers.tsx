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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Edit, Trash2, Plus, Users, UserPlus } from "lucide-react";
import { z } from "zod";
import api from "@/services/api";
import { toast } from "sonner";

export const AddUserSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  email: z.string().trim().email("Invalid email"),
  phone: z.string().trim().min(1, "Phone number is required"),
  password: z.string().trim().min(6, "Password must be at least 6 characters"),
  role: z.enum(["ADMIN", "CASHIER"]),
});

interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "ADMIN" | "CASHIER";
}

interface FormErrors {
  [key: string]: string;
}

function AddUsers() {
  const [users, setUsers] = useState<User[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isCreatingUser, setIsCreatingUser] = useState(false);
  const [userErrors, setUserErrors] = useState<FormErrors>({});

  // Form states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"ADMIN" | "CASHIER" | "">("");

  // Fetch users on component mount
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get("/admin/get-user");
      setUsers(response.data.allUsers || []);
    } catch (error: any) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to fetch users");
      }
    }
  };

  const handleAddUser = async () => {
    try {
      setUserErrors({});

      // Validate using Zod
      const validatedUser = AddUserSchema.parse({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        password: password.trim(),
        role: role as "ADMIN" | "CASHIER",
      });

      setIsCreatingUser(true);

      const response = await api.post("/admin/add-user", validatedUser);

      toast.success("User added successfully");

      // Reset form
      setName("");
      setEmail("");
      setPhone("");
      setPassword("");
      setRole("");

      // Refresh the user list
      await fetchUsers();
    } catch (error: any) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else if (error.errors) {
        // Zod validation errors
        const errors: FormErrors = {};
        error.errors.forEach((err: any) => {
          errors[err.path[0]] = err.message;
        });
        setUserErrors(errors);
      } else {
        toast.error("Failed to add user");
      }
    } finally {
      setIsCreatingUser(false);
    }
  };

  const handleEdit = (user: User) => {
    setEditingId(user.id);
    setName(user.name);
    setEmail(user.email);
    setPhone(user.phone);
    setPassword("");
    setRole(user.role);
  };

  const handleUpdate = async () => {
    if (
      editingId &&
      name.trim() &&
      email.trim() &&
      phone.trim() &&
      password.trim() &&
      role
    ) {
      try {
        setUserErrors({});

        // Validate using Zod
        const validatedUser = AddUserSchema.parse({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim(),
          password: password.trim(),
          role: role as "ADMIN" | "CASHIER",
        });

        setIsCreatingUser(true);

        await api.put(`/admin/edit-user/${editingId}`, validatedUser);

        // For now, just update locally
        setUsers((usersList) =>
          usersList.map((user) =>
            user.id === editingId
              ? {
                ...user,
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                role: role as "ADMIN" | "CASHIER",
              }
              : user
          )
        );

        toast.success("User updated successfully");

        // Reset form
        setEditingId(null);
        setName("");
        setEmail("");
        setPhone("");
        setPassword("");
        setRole("");
      } catch (error: any) {
        if (error.response?.data?.error) {
          toast.error(error.response.data.error);
        } else if (error.errors) {
          // Zod validation errors
          const errors: FormErrors = {};
          error.errors.forEach((err: any) => {
            errors[err.path[0]] = err.message;
          });
          setUserErrors(errors);
        } else {
          toast.error("Failed to update user");
        }
      } finally {
        setIsCreatingUser(false);
      }
    }
  };

  const handleDelete = async (id: string) => {
    try {

      // await api.delete(`/admin/delete-user/${id}`);

      setUsers((usersList) => usersList.filter((user) => user.id !== id));
      toast.success("User deleted successfully");
    } catch (error: any) {
      if (error.response?.data?.error) {
        toast.error(error.response.data.error);
      } else {
        toast.error("Failed to delete user");
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setName("");
    setEmail("");
    setPhone("");
    setPassword("");
    setRole("");
    setUserErrors({});
  };

  const getRoleBadgeColor = (role: string) => {
    return role === "ADMIN"
      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">User Management</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add/Edit User */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserPlus className="h-5 w-5" />
              {editingId ? "Edit User" : "Add New User"}
            </CardTitle>
            <CardDescription>
              {editingId
                ? "Update the user information below"
                : "Add a new user with the required details"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                placeholder="Enter full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className={userErrors.name ? "border-red-500" : ""}
              />
              {userErrors.name && (
                <p className="text-sm text-red-500">{userErrors.name}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={userErrors.email ? "border-red-500" : ""}
              />
              {userErrors.email && (
                <p className="text-sm text-red-500">{userErrors.email}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                placeholder="Enter phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className={userErrors.phone ? "border-red-500" : ""}
              />
              {userErrors.phone && (
                <p className="text-sm text-red-500">{userErrors.phone}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={userErrors.password ? "border-red-500" : ""}
              />
              {userErrors.password && (
                <p className="text-sm text-red-500">{userErrors.password}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as "ADMIN" | "CASHIER")}
              >
                <SelectTrigger className={userErrors.role ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ADMIN">ADMIN</SelectItem>
                  <SelectItem value="CASHIER">CASHIER</SelectItem>
                </SelectContent>
              </Select>
              {userErrors.role && (
                <p className="text-sm text-red-500">{userErrors.role}</p>
              )}
            </div>
            <div className="flex gap-2">
              {editingId ? (
                <>
                  <Button
                    onClick={handleUpdate}
                    className="flex-1"
                    disabled={isCreatingUser}
                  >
                    {isCreatingUser ? "Updating..." : "Update User"}
                  </Button>
                  <Button
                    onClick={handleCancel}
                    variant="outline"
                    disabled={isCreatingUser}
                  >
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  onClick={handleAddUser}
                  className="w-full"
                  disabled={isCreatingUser}
                >
                  {isCreatingUser ? (
                    "Adding..."
                  ) : (
                    <>
                      <Plus className="h-4 w-4 mr-2" />
                      Add User
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Users ({users.length})
            </CardTitle>
            <CardDescription>
              Manage your users with edit and delete actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No users found. Add your first user using the form.
              </div>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">
                          {user.name}
                        </TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phone}</TableCell>
                        <TableCell>
                          <span
                            className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                              user.role
                            )}`}
                          >
                            {user.role}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              onClick={() => handleDelete(user.id)}
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

export default AddUsers;
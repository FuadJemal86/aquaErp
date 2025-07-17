import React, { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Edit,
  Trash2,
  Search,
  Users,
  Download,
  MoreHorizontal,
  FileText,
  Calendar,
  Phone,
  MapPin,
  Upload,
  X,
  Image as ImageIcon,
  File,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Customer {
  id: number;
  full_name: string;
  phone: string;
  address: string;
  id_card?: string;
  createdAt: string;
  updatedAt: string;
}

interface ValidationErrors {
  full_name: boolean;
  phone: boolean;
  address: boolean;
}

function ListCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([
    {
      id: 1,
      full_name: "John Doe",
      phone: "+1234567890",
      address: "123 Main St, City, State 12345",
      id_card: "john_doe_id.jpg",
      createdAt: "2024-01-15T10:30:00Z",
      updatedAt: "2024-01-15T10:30:00Z",
    },
    {
      id: 2,
      full_name: "Jane Smith",
      phone: "+9876543210",
      address: "456 Oak Ave, Town, State 67890",
      createdAt: "2024-01-16T14:20:00Z",
      updatedAt: "2024-01-16T14:20:00Z",
    },
    {
      id: 3,
      full_name: "Bob Johnson",
      phone: "+1122334455",
      address: "789 Pine Rd, Village, State 11111",
      id_card: "bob_johnson_id.pdf",
      createdAt: "2024-01-17T09:15:00Z",
      updatedAt: "2024-01-17T09:15:00Z",
    },
  ]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({
    full_name: false,
    phone: false,
    address: false,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateForm = (customer: Customer): ValidationErrors => {
    return {
      full_name: !customer.full_name || customer.full_name.trim() === "",
      phone: !customer.phone || customer.phone.trim() === "",
      address: !customer.address || customer.address.trim() === "",
    };
  };

  const hasValidationErrors = (errors: ValidationErrors): boolean => {
    return Object.values(errors).some(error => error);
  };

  const handleDeleteClick = (id: number) => {
    setCustomerToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;

    try {
      setIsDeleting(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCustomers(customers.filter(c => c.id !== customerToDelete));
      console.log("Customer deleted successfully");
    } catch (error: any) {
      console.error("Error deleting customer:", error);
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCustomerToDelete(null);
    }
  };

  const handleEditClick = (customer: Customer) => {
    setCurrentCustomer(customer);
    setPreviewUrl(null);
    setSelectedFile(null);
    setValidationErrors({
      full_name: false,
      phone: false,
      address: false,
    });
    setEditModalOpen(true);
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);

      // Create preview URL for images
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleInputChange = (field: keyof Customer, value: string) => {
    if (!currentCustomer) return;

    const updatedCustomer = {
      ...currentCustomer,
      [field]: value,
    };

    setCurrentCustomer(updatedCustomer);

    // Clear validation error for this field if it now has a value
    if (value.trim() !== "") {
      setValidationErrors(prev => ({
        ...prev,
        [field]: false,
      }));
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCustomer) return;

    // Validate form
    const errors = validateForm(currentCustomer);
    setValidationErrors(errors);

    // If there are validation errors, don't submit
    if (hasValidationErrors(errors)) {
      return;
    }

    try {
      setIsSubmitting(true);

      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Update customer in the list
      setCustomers(customers.map(c =>
        c.id === currentCustomer.id ? currentCustomer : c
      ));

      console.log("Customer updated successfully");
      setEditModalOpen(false);
      setSelectedFile(null);
      setPreviewUrl(null);
      setValidationErrors({
        full_name: false,
        phone: false,
        address: false,
      });
    } catch (error: any) {
      console.error("Error updating customer:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDownloadIdCard = async (
    idCardPath: string,
    customerName: string
  ) => {
    try {
      // Simulate download
      console.log(`Downloading ID card for ${customerName}: ${idCardPath}`);
    } catch (error: any) {
      console.error("Error downloading file:", error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      customer.phone.includes(searchTerm) ||
      customer.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex items-center gap-2 mb-6">
          <Users className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold">Customer List</h1>
        </div>
        <Card>
          <CardContent className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-1 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <Users className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">Customer List</h1>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customers ({customers.length})
              </CardTitle>
              <CardDescription>
                Manage and view all your customers
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-full md:w-64"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {customers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium">No customers found</p>
              <p className="text-sm">Add your first customer to get started</p>
            </div>
          ) : (
            <div className="border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>#</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Users className="h-3 w-3 " />
                        Customer
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        Contact
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        Address
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                        ID Card
                      </div>
                    </TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        Created
                      </div>
                    </TableHead>
                    <TableHead className="text-right">
                      <div className="flex items-center gap-2">
                        <MoreHorizontal className="h-3 w-3 text-muted-foreground" />
                        Actions
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCustomers.map((customer, index) => (
                    <TableRow key={customer.id}>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span className="font-medium">
                            {customer.full_name}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm">{customer.phone}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 max-w-[200px]">
                          <span
                            className="text-sm truncate"
                            title={customer.address}
                          >
                            {customer.address}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {customer.id_card ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              handleDownloadIdCard(
                                customer.id_card!,
                                customer.full_name
                              )
                            }
                            className="flex items-center gap-2"
                          >
                            <Download className="h-3 w-3" />
                            <span className="text-xs">Download</span>
                          </Button>
                        ) : (
                          <Badge variant="secondary" className="text-xs">
                            No ID Card
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">
                            {formatDate(customer.createdAt)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleEditClick(customer)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(customer.id)}
                              className="text-red-600 focus:text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Customer Dialog */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Customer</DialogTitle>
            <DialogDescription>
              Update customer details below. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          {currentCustomer && (
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">
                    Full Name <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="full_name"
                      value={currentCustomer.full_name}
                      onChange={(e) => handleInputChange('full_name', e.target.value)}
                      className={`${validationErrors.full_name ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Enter full name"
                    />
                    {validationErrors.full_name && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                  </div>
                  {validationErrors.full_name && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Full name is required
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">
                    Phone Number <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Input
                      id="phone"
                      value={currentCustomer.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`${validationErrors.phone ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Enter phone number"
                    />
                    {validationErrors.phone && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                  </div>
                  {validationErrors.phone && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Phone number is required
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">
                    Address <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <Textarea
                      id="address"
                      value={currentCustomer.address}
                      onChange={(e) => handleInputChange('address', e.target.value)}
                      className={`${validationErrors.address ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                      placeholder="Enter address"
                      rows={3}
                    />
                    {validationErrors.address && (
                      <div className="absolute right-3 top-3">
                        <AlertCircle className="h-4 w-4 text-red-500" />
                      </div>
                    )}
                  </div>
                  {validationErrors.address && (
                    <p className="text-sm text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      Address is required
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>ID Card</Label>
                  {currentCustomer.id_card && !selectedFile && (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() =>
                          handleDownloadIdCard(
                            currentCustomer.id_card!,
                            currentCustomer.full_name
                          )
                        }
                        className="flex items-center gap-2"
                      >
                        <Download className="h-4 w-4" />
                        Download Current ID Card
                      </Button>
                    </div>
                  )}
                  {selectedFile ? (
                    <div className="space-y-3">
                      <div className="relative">
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
                          <div className="flex flex-col items-center justify-center space-y-3">
                            {previewUrl ? (
                              <div className="relative">
                                <img
                                  src={previewUrl}
                                  alt="Preview"
                                  className="w-32 h-32 object-cover rounded-lg border"
                                />
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                  onClick={handleRemoveFile}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            ) : (
                              <div className="relative">
                                {selectedFile.type.startsWith("image/") ? (
                                  <ImageIcon className="h-8 w-8 text-blue-500" />
                                ) : selectedFile.type === "application/pdf" ? (
                                  <FileText className="h-8 w-8 text-red-500" />
                                ) : (
                                  <File className="h-8 w-8 text-gray-500" />
                                )}
                                <Button
                                  type="button"
                                  size="sm"
                                  variant="destructive"
                                  className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0"
                                  onClick={handleRemoveFile}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </div>
                            )}
                            <div className="text-center">
                              <p className="text-sm font-medium text-gray-900">
                                {selectedFile.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <Input
                        id="id_card"
                        type="file"
                        ref={fileInputRef}
                        accept=".jpg,.jpeg,.png,.pdf"
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <label
                        htmlFor="id_card"
                        className="block w-full border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-gray-400 hover:bg-gray-50 transition-colors cursor-pointer"
                      >
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center">
                            <Upload className="h-8 w-8 text-gray-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              Click to upload new ID Card
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              JPG, PNG, PDF (max 5MB)
                            </p>
                          </div>
                        </div>
                      </label>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditModalOpen(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="min-w-[120px]"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Saving...
                    </div>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      {/* Delete Confirmation Dialog */}
      {deleteDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          {/* Custom Tailwind Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setDeleteDialogOpen(false)}
          />

          {/* Inner Content using shadcn/ui */}
          <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full mx-4 p-6">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
                <Trash2 className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Delete Customer
              </h3>
              <p className="text-gray-600 mb-6">
                This action cannot be undone. This will permanently delete the
                customer and all associated data.
              </p>
            </div>

            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setDeleteDialogOpen(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteConfirm}
                className="flex-1 bg-red-600 hover:bg-red-700"
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Deleting...
                  </div>
                ) : (
                  "Delete Customer"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ListCustomers;
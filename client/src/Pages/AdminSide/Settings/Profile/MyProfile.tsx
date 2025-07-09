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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Lock, Mail, Phone, Shield } from "lucide-react";

function MyProfile() {
  // Dummy user data
  const dummyUser = {
    name: "John Doe",
    email: "john.doe@example.com",
    phoneNumber: "+1 (555) 123-4567",
    role: "ADMIN",
    avatar: "https://github.com/shadcn.png",
  };

  // Form states for profile info
  const [phoneNumber, setPhoneNumber] = useState(dummyUser.phoneNumber);

  // Form states for password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleUpdateProfile = () => {
    // Handle profile update logic here
    console.log("Profile updated:", { phoneNumber });
  };

  const handleChangePassword = () => {
    if (newPassword === confirmPassword && newPassword.length >= 6) {
      // Handle password change logic here
      console.log("Password changed successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      alert("Passwords don't match or are too short!");
    }
  };

  const getRoleBadgeColor = (role: string) => {
    return role === "ADMIN"
      ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
      : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300";
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <User className="h-6 w-6 text-primary" />
        <h1 className="text-2xl font-bold">My Profile</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Profile Information
            </CardTitle>
            <CardDescription>Update your profile information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar and Basic Info */}
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={dummyUser.avatar} alt={dummyUser.name} />
                <AvatarFallback className="text-lg">
                  {dummyUser.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="text-lg font-semibold">{dummyUser.name}</h3>
                <span
                  className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleBadgeColor(
                    dummyUser.role
                  )}`}
                >
                  {dummyUser.role}
                </span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={dummyUser.name} className="bg-muted" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    value={dummyUser.email}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="role"
                    value={dummyUser.role}
                    disabled
                    className="bg-muted"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="phoneNumber"
                    placeholder="Enter phone number"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button onClick={handleUpdateProfile} className="w-full">
              Update Profile
            </Button>
          </CardContent>
        </Card>

        {/* Change Password */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Change Password
            </CardTitle>
            <CardDescription>Update your password securely</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <Input
                id="currentPassword"
                type="password"
                placeholder="Enter current password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="Enter new password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
              />
            </div>

            <div className="text-sm text-muted-foreground">
              <p>Password requirements:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>At least 6 characters long</li>
                <li>Passwords must match</li>
              </ul>
            </div>

            <Button onClick={handleChangePassword} className="w-full mt-21">
              Change Password
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Additional Info Card */}
    </div>
  );
}

export default MyProfile;

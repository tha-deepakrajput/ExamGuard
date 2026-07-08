"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  GraduationCap,
  Save,
  Key,
  Bell,
  BookOpen,
  TrendingUp,
  Trophy,
  Clock,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInitials, getAvatarColor } from "@/lib/utils";
import { toast } from "sonner";

export default function StudentProfilePage() {
  const [firstName, setFirstName] = useState("Arjun");
  const [lastName, setLastName] = useState("Sharma");
  const [email] = useState("arjun.sharma@example.com");
  const [phone, setPhone] = useState("+91 9876543210");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Notification preferences
  const [examReminders, setExamReminders] = useState(true);
  const [resultNotifications, setResultNotifications] = useState(true);
  const [violationAlerts, setViolationAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  const handleSaveProfile = () => {
    toast.success("Profile updated successfully! (Demo mode)");
  };

  const handleChangePassword = () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Please fill all password fields");
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }
    if (newPassword.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    toast.success("Password changed successfully! (Demo mode)");
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Profile"
        description="Manage your account settings and preferences"
        breadcrumbs={[
          { label: "Dashboard", href: "/student/dashboard" },
          { label: "Profile" },
        ]}
      />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="border-border/50">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-24 h-24 mb-4">
                  <AvatarFallback
                    className={`text-white text-2xl font-bold ${getAvatarColor(firstName)}`}
                  >
                    {getInitials(firstName, lastName)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">
                  {firstName} {lastName}
                </h2>
                <p className="text-sm text-muted-foreground mt-1">{email}</p>
                <div className="flex items-center gap-2 mt-3">
                  <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    Active
                  </Badge>
                  <Badge variant="outline" className="capitalize">
                    <GraduationCap className="w-3 h-3 mr-1" />
                    Student
                  </Badge>
                </div>
              </div>

              <Separator className="my-5" />

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-3">
                {[
                  { icon: BookOpen, label: "Exams Taken", value: "15", color: "text-blue-500", bg: "bg-blue-500/10" },
                  { icon: TrendingUp, label: "Avg Score", value: "82.5%", color: "text-emerald-500", bg: "bg-emerald-500/10" },
                  { icon: Trophy, label: "Best Score", value: "96%", color: "text-amber-500", bg: "bg-amber-500/10" },
                  { icon: CheckCircle2, label: "Pass Rate", value: "87%", color: "text-violet-500", bg: "bg-violet-500/10" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center p-3 rounded-xl bg-muted/50">
                    <div className={`w-8 h-8 rounded-lg mx-auto mb-1.5 flex items-center justify-center ${stat.bg}`}>
                      <stat.icon className={`w-4 h-4 ${stat.color}`} />
                    </div>
                    <p className="text-xs text-muted-foreground">{stat.label}</p>
                    <p className="text-sm font-bold mt-0.5">{stat.value}</p>
                  </div>
                ))}
              </div>

              <Separator className="my-5" />

              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Mail className="w-4 h-4" />
                  <span>{email}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Phone className="w-4 h-4" />
                  <span>{phone}</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Calendar className="w-4 h-4" />
                  <span>Joined September 1, 2024</span>
                </div>
                <div className="flex items-center gap-3 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>Last login: Today, 10:30 AM</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Main Content */}
        <motion.div
          className="lg:col-span-2"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Tabs defaultValue="personal">
            <TabsList>
              <TabsTrigger value="personal" className="gap-1.5">
                <User className="w-4 h-4" />
                Personal Info
              </TabsTrigger>
              <TabsTrigger value="security" className="gap-1.5">
                <Key className="w-4 h-4" />
                Security
              </TabsTrigger>
              <TabsTrigger value="notifications" className="gap-1.5">
                <Bell className="w-4 h-4" />
                Notifications
              </TabsTrigger>
            </TabsList>

            {/* Personal Info Tab */}
            <TabsContent value="personal" className="mt-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <User className="w-4 h-4 text-primary" />
                    Personal Information
                  </CardTitle>
                  <CardDescription>Update your personal details</CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="profile-firstName">First Name</Label>
                      <Input
                        id="profile-firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="profile-lastName">Last Name</Label>
                      <Input
                        id="profile-lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="h-11"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-email">Email</Label>
                    <Input
                      id="profile-email"
                      value={email}
                      disabled
                      className="h-11 bg-muted/30"
                    />
                    <p className="text-xs text-muted-foreground">
                      Email cannot be changed. Contact admin for assistance.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="profile-phone">Phone Number</Label>
                    <Input
                      id="profile-phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="h-11"
                    />
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button
                      className="gradient-primary text-white border-0 shadow-lg shadow-primary/25"
                      onClick={handleSaveProfile}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Changes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Security Tab */}
            <TabsContent value="security" className="mt-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Key className="w-4 h-4 text-primary" />
                    Change Password
                  </CardTitle>
                  <CardDescription>
                    Update your password to keep your account secure
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current-password"
                        type={showCurrentPassword ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current password"
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showCurrentPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new-password"
                        type={showNewPassword ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="Enter new password"
                        className="h-11 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showNewPassword ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                    {newPassword && (
                      <div className="space-y-1 mt-2">
                        {[
                          { label: "At least 8 characters", valid: newPassword.length >= 8 },
                          { label: "Contains uppercase letter", valid: /[A-Z]/.test(newPassword) },
                          { label: "Contains number", valid: /[0-9]/.test(newPassword) },
                          { label: "Contains special character", valid: /[^A-Za-z0-9]/.test(newPassword) },
                        ].map((rule) => (
                          <div key={rule.label} className="flex items-center gap-2 text-xs">
                            {rule.valid ? (
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            ) : (
                              <div className="w-3.5 h-3.5 rounded-full border border-muted-foreground/30" />
                            )}
                            <span className={rule.valid ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground"}>
                              {rule.label}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm new password"
                      className="h-11"
                    />
                    {confirmPassword && newPassword !== confirmPassword && (
                      <p className="text-xs text-rose-500">Passwords don&apos;t match</p>
                    )}
                  </div>
                  <div className="flex justify-end pt-2">
                    <Button
                      className="gradient-primary text-white border-0 shadow-lg shadow-primary/25"
                      onClick={handleChangePassword}
                    >
                      <Key className="w-4 h-4 mr-2" />
                      Change Password
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="mt-6">
              <Card className="border-border/50">
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Bell className="w-4 h-4 text-primary" />
                    Notification Preferences
                  </CardTitle>
                  <CardDescription>
                    Control which notifications you receive
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-5">
                  {[
                    {
                      label: "Exam Reminders",
                      desc: "Get notified before upcoming exams",
                      checked: examReminders,
                      onChange: setExamReminders,
                    },
                    {
                      label: "Result Notifications",
                      desc: "Get notified when exam results are published",
                      checked: resultNotifications,
                      onChange: setResultNotifications,
                    },
                    {
                      label: "Violation Alerts",
                      desc: "Receive alerts about proctoring violations",
                      checked: violationAlerts,
                      onChange: setViolationAlerts,
                    },
                    {
                      label: "Weekly Digest",
                      desc: "Receive a weekly summary of your performance",
                      checked: weeklyDigest,
                      onChange: setWeeklyDigest,
                    },
                  ].map((item, i) => (
                    <div key={item.label}>
                      <div className="flex items-center justify-between">
                        <div>
                          <Label className="text-sm font-medium">{item.label}</Label>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {item.desc}
                          </p>
                        </div>
                        <Switch
                          checked={item.checked}
                          onCheckedChange={item.onChange}
                        />
                      </div>
                      {i < 3 && <Separator className="mt-4" />}
                    </div>
                  ))}
                  <div className="flex justify-end pt-2">
                    <Button
                      className="gradient-primary text-white border-0 shadow-lg shadow-primary/25"
                      onClick={() =>
                        toast.success(
                          "Notification preferences saved! (Demo mode)"
                        )
                      }
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save Preferences
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}

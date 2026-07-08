"use client";

import { useState, useEffect, use } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ArrowLeft,
  Mail,
  Phone,
  Calendar,
  Clock,
  Shield,
  GraduationCap,
  Ban,
  CheckCircle2,
  Key,
  FileText,
  Trophy,
  TrendingUp,
  AlertTriangle,
  Activity,
  Loader2,
  Trash2,
  Edit,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getInitials, getAvatarColor } from "@/lib/utils";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { useSession } from "next-auth/react";

interface UserDetails {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: string;
  status: string;
  phone: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  examHistory: Array<{
    id: string;
    title: string;
    date: string | null;
    score: number;
    status: string;
    isPassed: boolean | null;
  }>;
  stats: {
    avgScore: number;
    bestScore: number;
    examsCompleted: number;
    totalViolations: number;
  };
  activityLog: Array<{
    action: string;
    time: string;
    icon: any;
    color: string;
  }>;
}

const statusConfig: Record<string, { label: string; className: string }> = {
  active: { label: "Active", className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20" },
  inactive: { label: "Inactive", className: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400 border-zinc-500/20" },
  suspended: { label: "Suspended", className: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20" },
  pending_verification: { label: "Pending Verification", className: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20" },
};

export default function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { data: session, update: updateSession } = useSession();
  const [user, setUser] = useState<UserDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "student",
  });

  useEffect(() => {
    async function fetchUser() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/admin/users/${id}`);
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUser(data);
        setEditForm({
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          role: data.role,
        });
      } catch (err) {
        toast.error("Failed to load user details");
      } finally {
        setIsLoading(false);
      }
    }
    fetchUser();
  }, [id]);

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update status");
      
      setUser((prev) => prev ? { ...prev, status: newStatus } : null);
      toast.success(`User status updated to ${newStatus}`);
    } catch (err) {
      toast.error("Failed to update user status");
    }
  };

  const handleEditProfile = async () => {
    if (!editForm.firstName.trim() || !editForm.lastName.trim() || !editForm.email.trim()) {
      toast.error("All fields are required");
      return;
    }

    try {
      setIsSaving(true);
      
      const payload = { ...editForm };
      if (session?.user?.id === id) {
        delete (payload as any).role;
      }

      const res = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Failed to update profile");
      }
      
      setUser((prev) => prev ? { ...prev, ...editForm } : null);
      toast.success("Profile updated successfully");
      
      if (session?.user?.id === id) {
        await updateSession({ user: editForm });
      }

      setEditDialogOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await fetch(`/api/admin/users/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete user");
      
      toast.success("User deleted successfully");
      window.location.href = "/admin/users";
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading user details...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertTriangle className="w-12 h-12 text-amber-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">User Not Found</h2>
        <p className="text-muted-foreground mb-4">The user you are looking for does not exist or has been deleted.</p>
        <Link href="/admin/users">
          <Button>Back to Users</Button>
        </Link>
      </div>
    );
  }

  const stCfg = statusConfig[user.status] || statusConfig.active;

  const formatDate = (dateStr: string) =>
    new Date(dateStr).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${user.firstName} ${user.lastName}`}
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Users", href: "/admin/users" },
          { label: `${user.firstName} ${user.lastName}` },
        ]}
        actions={
          <Link href="/admin/users">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Users
            </Button>
          </Link>
        }
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
                <Avatar className="w-20 h-20 mb-4">
                  <AvatarFallback className={`text-xl font-semibold text-white ${getAvatarColor(user.firstName)}`}>
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <h2 className="text-xl font-bold">{user.firstName} {user.lastName}</h2>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="outline" className="flex items-center gap-1">
                    {user.role === "student" ? (
                      <GraduationCap className="w-3 h-3" />
                    ) : (
                      <Shield className="w-3 h-3" />
                    )}
                    <span className="capitalize">{user.role.replace("_", " ")}</span>
                  </Badge>
                  <Badge variant="secondary" className={stCfg.className}>
                    {stCfg.label}
                  </Badge>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Mail className="w-4 h-4 text-primary" />
                  </div>
                  <div className="overflow-hidden">
                    <p className="text-muted-foreground text-xs">Email Address</p>
                    <p className="font-medium truncate">{user.email}</p>
                  </div>
                </div>
                {user.phone && (
                  <div className="flex items-center gap-3 text-sm">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                      <Phone className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs">Phone Number</p>
                      <p className="font-medium">{user.phone}</p>
                    </div>
                  </div>
                )}
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Calendar className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Joined Date</p>
                    <p className="font-medium">{formatDate(user.createdAt)}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">Last Login</p>
                    <p className="font-medium">{user.lastLoginAt ? formatDate(user.lastLoginAt) : "Never"}</p>
                  </div>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="space-y-3">
                <p className="text-sm font-semibold mb-2">Actions</p>
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" className="w-full" onClick={() => toast.info("Password reset feature coming soon")}>
                    <Key className="w-4 h-4 mr-2" />
                    Reset Pass
                  </Button>
                  <Button variant="outline" className="w-full" onClick={() => setEditDialogOpen(true)}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </Button>
                </div>
                {user.status === "active" ? (
                  <Button
                    variant="outline"
                    className="w-full text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                    onClick={() =>
                      setConfirmDialog({
                        open: true,
                        title: "Suspend User",
                        description: `Are you sure you want to suspend ${user.firstName}? They will not be able to login.`,
                        onConfirm: () => {
                          handleUpdateStatus("suspended");
                          setConfirmDialog((d) => ({ ...d, open: false }));
                        },
                      })
                    }
                  >
                    <Ban className="w-4 h-4 mr-2" />
                    Suspend User
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    className="w-full text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                    onClick={() => handleUpdateStatus("active")}
                  >
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Activate User
                  </Button>
                )}
                <Button
                  variant="outline"
                  className="w-full text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() =>
                    setConfirmDialog({
                      open: true,
                      title: "Delete User",
                      description: `Are you sure you want to completely remove ${user.firstName}? This action cannot be undone.`,
                      onConfirm: () => {
                        handleDelete();
                        setConfirmDialog((d) => ({ ...d, open: false }));
                      },
                    })
                  }
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete User
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Details & History */}
        <motion.div
          className="lg:col-span-2 space-y-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          {/* Quick Stats */}
          <div className="grid sm:grid-cols-4 gap-4">
            <Card className="border-border/50">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <FileText className="w-6 h-6 text-blue-500 mb-2" />
                <p className="text-2xl font-bold">{user.stats.examsCompleted}</p>
                <p className="text-xs text-muted-foreground">Exams Taken</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <TrendingUp className="w-6 h-6 text-emerald-500 mb-2" />
                <p className="text-2xl font-bold">{user.stats.avgScore}%</p>
                <p className="text-xs text-muted-foreground">Avg Score</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <Trophy className="w-6 h-6 text-amber-500 mb-2" />
                <p className="text-2xl font-bold">{user.stats.bestScore}%</p>
                <p className="text-xs text-muted-foreground">Best Score</p>
              </CardContent>
            </Card>
            <Card className="border-border/50">
              <CardContent className="p-4 flex flex-col items-center justify-center text-center">
                <AlertTriangle className="w-6 h-6 text-rose-500 mb-2" />
                <p className="text-2xl font-bold">{user.stats.totalViolations}</p>
                <p className="text-xs text-muted-foreground">Violations</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Card className="border-border/50">
            <Tabs defaultValue="exams" className="w-full">
              <CardHeader className="pb-0 border-b border-border/50">
                <TabsList className="w-full justify-start rounded-none bg-transparent h-auto p-0 gap-6">
                  <TabsTrigger
                    value="exams"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 font-medium"
                  >
                    Exam History
                  </TabsTrigger>
                  <TabsTrigger
                    value="activity"
                    className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none px-0 pb-3 font-medium"
                  >
                    Activity Log
                  </TabsTrigger>
                </TabsList>
              </CardHeader>
              <CardContent className="p-0">
                <TabsContent value="exams" className="m-0">
                  {user.examHistory.length > 0 ? (
                    <div className="divide-y divide-border/50">
                      {user.examHistory.map((exam, i) => (
                        <div key={i} className="p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                          <div className="flex flex-col gap-1">
                            <p className="font-medium">{exam.title}</p>
                            <p className="text-xs text-muted-foreground">
                              Completed: {exam.date ? formatDate(exam.date) : "N/A"}
                            </p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-bold">{exam.score}%</p>
                              <Badge variant="outline" className={exam.isPassed ? "text-emerald-500 border-emerald-500/30" : "text-rose-500 border-rose-500/30"}>
                                {exam.isPassed ? "Passed" : "Failed"}
                              </Badge>
                            </div>
                            <Link href={`/admin/reports/${exam.id}`}>
                              <Button variant="ghost" size="icon">
                                <ArrowLeft className="w-4 h-4 rotate-135" />
                              </Button>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <FileText className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No exams taken yet</p>
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="activity" className="m-0">
                  {user.activityLog.length > 0 ? (
                    <div className="p-6 relative before:absolute before:inset-0 before:ml-8 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-border before:to-transparent">
                      {user.activityLog.map((log, i) => (
                        <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active pb-6 last:pb-0">
                          <div className="flex items-center justify-center w-8 h-8 rounded-full border-4 border-background bg-muted z-10 text-muted-foreground group-[.is-active]:bg-primary/10 group-[.is-active]:text-primary group-[.is-active]:border-primary/20 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm shrink-0">
                            <log.icon className={`w-3.5 h-3.5 ${log.color}`} />
                          </div>
                          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] border border-border/50 rounded-lg p-3 shadow-sm bg-card hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-xs text-muted-foreground">{log.time}</span>
                            </div>
                            <p className="text-sm font-medium">{log.action}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-8 text-center text-muted-foreground">
                      <Activity className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>No activity recorded</p>
                    </div>
                  )}
                </TabsContent>
              </CardContent>
            </Tabs>
          </Card>
        </motion.div>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((d) => ({ ...d, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
      />

      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update the user's name and email address.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  value={editForm.firstName}
                  onChange={(e) => setEditForm({ ...editForm, firstName: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  value={editForm.lastName}
                  onChange={(e) => setEditForm({ ...editForm, lastName: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={editForm.role}
                onValueChange={(val) => setEditForm({ ...editForm, role: val || "" })}
                disabled={session?.user?.id === id}
              >
                <SelectTrigger id="role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
              {session?.user?.id === id && (
                <p className="text-xs text-muted-foreground mt-1">
                  You cannot change your own role.
                </p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              className="gradient-primary text-white border-0"
              onClick={handleEditProfile}
              disabled={isSaving}
            >
              {isSaving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

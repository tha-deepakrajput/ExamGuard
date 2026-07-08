"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Users,
  UserPlus,
  Shield,
  GraduationCap,
  MoreHorizontal,
  Eye,
  Ban,
  CheckCircle2,
  Trash2,
  Mail,
  Filter,
  Download,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { StatCard } from "@/components/shared/stat-card";
import { DataTable, type Column } from "@/components/shared/data-table";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getInitials, getAvatarColor } from "@/lib/utils";
import { toast } from "sonner";
import Link from "next/link";

// ─── Types ──────────────────────────────────────────────────────
type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "super_admin" | "admin" | "student";
  status: "active" | "inactive" | "suspended" | "pending_verification";
  phone: string | null;
  lastLoginAt: string | null;
  createdAt: string;
  emailVerified: boolean;
  examsCompleted: number;
};

interface UserStats {
  total: number;
  active: number;
  students: number;
  admins: number;
}

type StatusFilter = "all" | "active" | "inactive" | "suspended" | "pending_verification";
type RoleFilter = "all" | "super_admin" | "admin" | "student";

const statusConfig: Record<string, { label: string; className: string }> = {
  active: {
    label: "Active",
    className: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  inactive: {
    label: "Inactive",
    className: "bg-zinc-500/10 text-zinc-600 dark:text-zinc-400",
  },
  suspended: {
    label: "Suspended",
    className: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
  },
  pending_verification: {
    label: "Pending",
    className: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
};

const roleConfig: Record<string, { label: string; icon: React.ElementType }> = {
  super_admin: { label: "Super Admin", icon: Shield },
  admin: { label: "Admin", icon: Shield },
  student: { label: "Student", icon: GraduationCap },
};

export default function AdminUsersPage() {
  const [usersList, setUsersList] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({ total: 0, active: 0, students: 0, admins: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: string;
    onConfirm: () => void;
    isLoading?: boolean;
  }>({ open: false, title: "", description: "", onConfirm: () => {} });

  // Add User form state
  const [newFirstName, setNewFirstName] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("student");
  const [newPassword, setNewPassword] = useState("");

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/users");
      if (!res.ok) throw new Error("Failed to fetch users");
      const data = await res.json();
      setUsersList(data.users);
      setStats(data.stats);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Client-side filtering (data already loaded)
  const filtered = usersList.filter((user) => {
    if (statusFilter !== "all" && user.status !== statusFilter) return false;
    if (roleFilter !== "all" && user.role !== roleFilter) return false;
    return true;
  });

  const handleCreateUser = async () => {
    if (!newFirstName.trim() || !newLastName.trim() || !newEmail.trim() || !newPassword.trim()) {
      toast.error("All fields are required");
      return;
    }
    setIsCreating(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: newFirstName,
          lastName: newLastName,
          email: newEmail,
          role: newRole,
          password: newPassword,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to create user");
      }
      toast.success("User created successfully");
      setAddUserOpen(false);
      setNewFirstName("");
      setNewLastName("");
      setNewEmail("");
      setNewRole("student");
      setNewPassword("");
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to create user");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateStatus = async (user: User, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to update user");
      }
      toast.success(`${user.firstName} has been ${newStatus === "active" ? "activated" : newStatus}`);
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to update user status");
    }
  };

  const handleDeleteUser = async (user: User) => {
    try {
      const res = await fetch(`/api/admin/users/${user.id}`, {
        method: "DELETE",
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to delete user");
      }
      toast.success(`${user.firstName} has been deleted`);
      await fetchUsers();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    }
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return "Never";
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const columns: Column<User>[] = [
    {
      key: "name",
      header: "User",
      sortable: true,
      render: (user) => (
        <Link
          href={`/admin/users/${user.id}`}
          className="flex items-center gap-3 group"
        >
          <Avatar className="w-9 h-9">
            <AvatarFallback
              className={`text-white text-xs font-semibold ${getAvatarColor(
                user.firstName
              )}`}
            >
              {getInitials(user.firstName, user.lastName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <p className="text-sm font-medium group-hover:text-primary transition-colors">
              {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-muted-foreground">{user.email}</p>
          </div>
        </Link>
      ),
    },
    {
      key: "role",
      header: "Role",
      sortable: true,
      render: (user) => {
        const config = roleConfig[user.role];
        return (
          <div className="flex items-center gap-1.5">
            <config.icon className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="text-sm">{config.label}</span>
          </div>
        );
      },
    },
    {
      key: "status",
      header: "Status",
      sortable: true,
      render: (user) => {
        const config = statusConfig[user.status];
        return (
          <Badge variant="secondary" className={config?.className}>
            {config?.label || user.status}
          </Badge>
        );
      },
    },
    {
      key: "examsCompleted",
      header: "Exams",
      sortable: true,
      className: "text-center",
      render: (user) => (
        <span className="text-sm text-muted-foreground">
          {user.examsCompleted}
        </span>
      ),
    },
    {
      key: "lastLoginAt",
      header: "Last Login",
      sortable: true,
      render: (user) => (
        <span className="text-sm text-muted-foreground">
          {formatDate(user.lastLoginAt)}
        </span>
      ),
    },
    {
      key: "actions",
      header: "",
      className: "w-12",
      render: (user) => (
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="w-8 h-8 rounded-full"
              />
            }
          >
            <MoreHorizontal className="w-4 h-4" />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem render={<Link href={`/admin/users/${user.id}`} />}>
              <Eye className="w-4 h-4 mr-2" />
              View Details
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => toast.info("Email feature coming soon")}
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Email
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            {user.status === "active" ? (
              <DropdownMenuItem
                onClick={() =>
                  setConfirmDialog({
                    open: true,
                    title: "Suspend User",
                    description: `Are you sure you want to suspend ${user.firstName} ${user.lastName}? They will not be able to login.`,
                    onConfirm: async () => {
                      await handleUpdateStatus(user, "suspended");
                      setConfirmDialog((d) => ({ ...d, open: false }));
                    },
                  })
                }
                className="text-amber-600 dark:text-amber-400"
              >
                <Ban className="w-4 h-4 mr-2" />
                Suspend
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem
                onClick={async () => {
                  await handleUpdateStatus(user, "active");
                }}
                className="text-emerald-600 dark:text-emerald-400"
              >
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Activate
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() =>
                setConfirmDialog({
                  open: true,
                  title: "Delete User",
                  description: `Are you sure you want to permanently delete ${user.firstName} ${user.lastName}? This action cannot be undone.`,
                  onConfirm: async () => {
                    await handleDeleteUser(user);
                    setConfirmDialog((d) => ({ ...d, open: false }));
                  },
                })
              }
              className="text-destructive focus:text-destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="User Management"
        description="Manage students, admins, and platform users"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Users" },
        ]}
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchUsers()}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => toast.info("Export feature coming soon")}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
            <Button
              size="sm"
              className="gradient-primary text-white border-0 shadow-lg shadow-primary/25"
              onClick={() => setAddUserOpen(true)}
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Add User
            </Button>
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={stats.total}
          icon={Users}
          gradient="from-blue-500 to-indigo-600"
          bgGlow="bg-blue-500/10"
          delay={0}
        />
        <StatCard
          title="Active Users"
          value={stats.active}
          icon={CheckCircle2}
          gradient="from-emerald-500 to-teal-600"
          bgGlow="bg-emerald-500/10"
          delay={0.1}
        />
        <StatCard
          title="Students"
          value={stats.students}
          icon={GraduationCap}
          gradient="from-violet-500 to-purple-600"
          bgGlow="bg-violet-500/10"
          delay={0.2}
        />
        <StatCard
          title="Admins"
          value={stats.admins}
          icon={Shield}
          gradient="from-amber-500 to-orange-600"
          bgGlow="bg-amber-500/10"
          delay={0.3}
        />
      </div>

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        <Tabs
          value={statusFilter}
          onValueChange={(v) => v && setStatusFilter(v as StatusFilter)}
        >
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="active">Active</TabsTrigger>
            <TabsTrigger value="suspended">Suspended</TabsTrigger>
            <TabsTrigger value="inactive">Inactive</TabsTrigger>
            <TabsTrigger value="pending_verification">Pending</TabsTrigger>
          </TabsList>
        </Tabs>
        <Select
          value={roleFilter}
          onValueChange={(v) => v && setRoleFilter(v as RoleFilter)}
        >
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Role" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Roles</SelectItem>
            <SelectItem value="super_admin">Super Admin</SelectItem>
            <SelectItem value="admin">Admin</SelectItem>
            <SelectItem value="student">Student</SelectItem>
          </SelectContent>
        </Select>
      </motion.div>

      {/* Data Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <DataTable
          data={filtered}
          columns={columns}
          searchKey="firstName"
          searchPlaceholder="Search users by name..."
          selectable
          pageSize={8}
          emptyTitle="No users found"
          emptyDescription="No users match the current filters."
          emptyIcon={Users}
        />
      </motion.div>

      {/* Add User Dialog */}
      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
            <DialogDescription>
              Create a new user account on the platform.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="add-firstName">First Name</Label>
                <Input
                  id="add-firstName"
                  placeholder="John"
                  value={newFirstName}
                  onChange={(e) => setNewFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="add-lastName">Last Name</Label>
                <Input
                  id="add-lastName"
                  placeholder="Doe"
                  value={newLastName}
                  onChange={(e) => setNewLastName(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-email">Email</Label>
              <Input
                id="add-email"
                type="email"
                placeholder="john@example.com"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-role">Role</Label>
              <Select value={newRole} onValueChange={(val) => setNewRole(val || "student")}>
                <SelectTrigger id="add-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="student">Student</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="add-password">Temporary Password</Label>
              <Input
                id="add-password"
                type="password"
                placeholder="Enter temporary password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddUserOpen(false)}>
              Cancel
            </Button>
            <Button
              className="gradient-primary text-white border-0"
              onClick={handleCreateUser}
              disabled={isCreating}
            >
              {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((d) => ({ ...d, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        onConfirm={confirmDialog.onConfirm}
      />
    </div>
  );
}

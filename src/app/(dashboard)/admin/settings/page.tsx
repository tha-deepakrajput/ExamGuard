"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Settings,
  Shield,
  Bell,
  Lock,
  Globe,
  Palette,
  Save,
  Eye,
  Clock,
  Camera,
  AlertTriangle,
  Mail,
  Key,
  MonitorSmartphone,
  CheckCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";

export default function AdminSettingsPage() {
  // General settings
  const [platformName, setPlatformName] = useState("ExamGuard");
  const [platformDesc, setPlatformDesc] = useState("AI-Powered Online Examination Platform");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [defaultDuration, setDefaultDuration] = useState("60");
  const [defaultPassingPercentage, setDefaultPassingPercentage] = useState("40");

  // Proctoring settings
  const [defaultProctoring, setDefaultProctoring] = useState(true);
  const [defaultMaxViolations, setDefaultMaxViolations] = useState("5");
  const [defaultAutoTerminate, setDefaultAutoTerminate] = useState(true);
  const [webcamRequired, setWebcamRequired] = useState(true);
  const [screenshotInterval, setScreenshotInterval] = useState("30");
  const [faceDetectionSensitivity, setFaceDetectionSensitivity] = useState("medium");
  const [blockTabSwitch, setBlockTabSwitch] = useState(true);
  const [blockCopyPaste, setBlockCopyPaste] = useState(true);
  const [blockRightClick, setBlockRightClick] = useState(true);
  const [blockDevTools, setBlockDevTools] = useState(true);
  const [requireFullscreen, setRequireFullscreen] = useState(true);

  // Notification settings
  const [emailVerification, setEmailVerification] = useState(true);
  const [examReminders, setExamReminders] = useState(true);
  const [violationAlerts, setViolationAlerts] = useState(true);
  const [resultNotifications, setResultNotifications] = useState(true);
  const [reminderHours, setReminderHours] = useState("24");
  const [adminViolationEmail, setAdminViolationEmail] = useState(true);
  const [weeklyReport, setWeeklyReport] = useState(true);

  // Security settings
  const [sessionTimeout, setSessionTimeout] = useState("24");
  const [minPasswordLength, setMinPasswordLength] = useState("8");
  const [requireUppercase, setRequireUppercase] = useState(true);
  const [requireNumber, setRequireNumber] = useState(true);
  const [requireSpecial, setRequireSpecial] = useState(true);
  const [maxLoginAttempts, setMaxLoginAttempts] = useState("5");
  const [lockoutDuration, setLockoutDuration] = useState("30");

  const handleSave = () => {
    toast.success("Settings saved successfully! (Demo mode)");
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="System Settings"
        description="Configure platform-wide settings and preferences"
        breadcrumbs={[
          { label: "Dashboard", href: "/admin/dashboard" },
          { label: "Settings" },
        ]}
        actions={
          <Button
            className="gradient-primary text-white border-0 shadow-lg shadow-primary/25"
            onClick={handleSave}
          >
            <Save className="w-4 h-4 mr-2" />
            Save Changes
          </Button>
        }
      />

      <Tabs defaultValue="general">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="general" className="gap-1.5">
            <Globe className="w-4 h-4" />
            <span className="hidden sm:inline">General</span>
          </TabsTrigger>
          <TabsTrigger value="proctoring" className="gap-1.5">
            <Shield className="w-4 h-4" />
            <span className="hidden sm:inline">Proctoring</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-1.5">
            <Bell className="w-4 h-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-1.5">
            <Lock className="w-4 h-4" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
        </TabsList>

        {/* General Tab */}
        <TabsContent value="general" className="mt-6 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Palette className="w-4 h-4 text-primary" />
                  Platform Identity
                </CardTitle>
                <CardDescription>Configure the branding and basic platform settings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="platform-name">Platform Name</Label>
                    <Input id="platform-name" value={platformName} onChange={(e) => setPlatformName(e.target.value)} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="timezone">Timezone</Label>
                    <Select value={timezone} onValueChange={(v) => v && setTimezone(v)}>
                      <SelectTrigger id="timezone" className="h-11">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Asia/Kolkata">Asia/Kolkata (IST)</SelectItem>
                        <SelectItem value="America/New_York">America/New York (EST)</SelectItem>
                        <SelectItem value="Europe/London">Europe/London (GMT)</SelectItem>
                        <SelectItem value="Asia/Tokyo">Asia/Tokyo (JST)</SelectItem>
                        <SelectItem value="Australia/Sydney">Australia/Sydney (AEST)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="platform-desc">Platform Description</Label>
                  <Textarea id="platform-desc" value={platformDesc} onChange={(e) => setPlatformDesc(e.target.value)} rows={2} />
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary" />
                  Exam Defaults
                </CardTitle>
                <CardDescription>Default settings applied to newly created exams</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="default-duration">Default Duration (minutes)</Label>
                    <Input id="default-duration" type="number" value={defaultDuration} onChange={(e) => setDefaultDuration(e.target.value)} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="default-passing">Default Passing Percentage</Label>
                    <Input id="default-passing" type="number" value={defaultPassingPercentage} onChange={(e) => setDefaultPassingPercentage(e.target.value)} className="h-11" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Proctoring Tab */}
        <TabsContent value="proctoring" className="mt-6 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Camera className="w-4 h-4 text-primary" />
                  Camera & Monitoring
                </CardTitle>
                <CardDescription>Configure webcam and AI monitoring defaults</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Enable Proctoring by Default</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">New exams will have proctoring enabled</p>
                  </div>
                  <Switch checked={defaultProctoring} onCheckedChange={setDefaultProctoring} />
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Require Webcam</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Students must enable webcam to start exam</p>
                  </div>
                  <Switch checked={webcamRequired} onCheckedChange={setWebcamRequired} />
                </div>
                <Separator />
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Screenshot Interval (seconds)</Label>
                    <Input type="number" value={screenshotInterval} onChange={(e) => setScreenshotInterval(e.target.value)} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label>Face Detection Sensitivity</Label>
                    <Select value={faceDetectionSensitivity} onValueChange={(v) => v && setFaceDetectionSensitivity(v)}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="low">Low — Fewer false positives</SelectItem>
                        <SelectItem value="medium">Medium — Balanced</SelectItem>
                        <SelectItem value="high">High — Strict monitoring</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Violation Settings
                </CardTitle>
                <CardDescription>Configure violation thresholds and auto-termination</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Default Max Violations</Label>
                    <Input type="number" value={defaultMaxViolations} onChange={(e) => setDefaultMaxViolations(e.target.value)} className="h-11" />
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-sm font-medium">Auto-terminate on Max Violations</Label>
                    <p className="text-xs text-muted-foreground mt-0.5">Automatically end exam when limit is reached</p>
                  </div>
                  <Switch checked={defaultAutoTerminate} onCheckedChange={setDefaultAutoTerminate} />
                </div>
                <Separator />
                <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Browser Controls</p>
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { label: "Block Tab Switching", checked: blockTabSwitch, onChange: setBlockTabSwitch },
                    { label: "Block Copy/Paste", checked: blockCopyPaste, onChange: setBlockCopyPaste },
                    { label: "Block Right Click", checked: blockRightClick, onChange: setBlockRightClick },
                    { label: "Block Dev Tools", checked: blockDevTools, onChange: setBlockDevTools },
                    { label: "Require Fullscreen", checked: requireFullscreen, onChange: setRequireFullscreen },
                  ].map((control) => (
                    <div key={control.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <span className="text-sm">{control.label}</span>
                      <Switch checked={control.checked} onCheckedChange={control.onChange} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications" className="mt-6 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Mail className="w-4 h-4 text-primary" />
                  Email Notifications
                </CardTitle>
                <CardDescription>Control which emails are sent to users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: "Email Verification", desc: "Send verification email on registration", checked: emailVerification, onChange: setEmailVerification },
                  { label: "Exam Reminders", desc: "Remind students about upcoming exams", checked: examReminders, onChange: setExamReminders },
                  { label: "Violation Alerts", desc: "Alert admins about critical violations", checked: violationAlerts, onChange: setViolationAlerts },
                  { label: "Result Notifications", desc: "Notify students when results are published", checked: resultNotifications, onChange: setResultNotifications },
                  { label: "Admin Violation Reports", desc: "Send violation summary emails to admins", checked: adminViolationEmail, onChange: setAdminViolationEmail },
                  { label: "Weekly Analytics Report", desc: "Send weekly performance report to admins", checked: weeklyReport, onChange: setWeeklyReport },
                ].map((item, i) => (
                  <div key={item.label}>
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="text-sm font-medium">{item.label}</Label>
                        <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                      </div>
                      <Switch checked={item.checked} onCheckedChange={item.onChange} />
                    </div>
                    {i < 5 && <Separator className="mt-4" />}
                  </div>
                ))}
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="w-4 h-4 text-primary" />
                  Reminder Timing
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label>Send Reminder Before Exam (hours)</Label>
                  <Input type="number" value={reminderHours} onChange={(e) => setReminderHours(e.target.value)} className="h-11 max-w-xs" />
                  <p className="text-xs text-muted-foreground">Students will receive an email reminder this many hours before the exam starts.</p>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>

        {/* Security Tab */}
        <TabsContent value="security" className="mt-6 space-y-6">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary" />
                  Password Policy
                </CardTitle>
                <CardDescription>Configure password requirements for all users</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="space-y-2">
                  <Label>Minimum Password Length</Label>
                  <Input type="number" value={minPasswordLength} onChange={(e) => setMinPasswordLength(e.target.value)} className="h-11 max-w-xs" />
                </div>
                <Separator />
                <div className="grid sm:grid-cols-2 gap-3">
                  {[
                    { label: "Require Uppercase Letter", checked: requireUppercase, onChange: setRequireUppercase },
                    { label: "Require Number", checked: requireNumber, onChange: setRequireNumber },
                    { label: "Require Special Character", checked: requireSpecial, onChange: setRequireSpecial },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                      <span className="text-sm">{item.label}</span>
                      <Switch checked={item.checked} onCheckedChange={item.onChange} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MonitorSmartphone className="w-4 h-4 text-primary" />
                  Session & Login Security
                </CardTitle>
                <CardDescription>Configure session management and login protection</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Session Timeout (hours)</Label>
                    <Input type="number" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Login Attempts</Label>
                    <Input type="number" value={maxLoginAttempts} onChange={(e) => setMaxLoginAttempts(e.target.value)} className="h-11" />
                  </div>
                  <div className="space-y-2">
                    <Label>Lockout Duration (min)</Label>
                    <Input type="number" value={lockoutDuration} onChange={(e) => setLockoutDuration(e.target.value)} className="h-11" />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  After {maxLoginAttempts} failed login attempts, the account will be locked for {lockoutDuration} minutes.
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  Heart,
  FileText,
  Upload,
  TrendingUp,
  Calendar,
  LogOut,
  Plus,
  Activity,
  Clock,
} from "lucide-react";
import dashboardImage from "@/assets/dashboard-illustration.jpg";

export default function Dashboard() {
  const navigate = useNavigate();
  const [reports] = useState([
    {
      id: 1,
      title: "Blood Test Report",
      date: "2025-01-15",
      type: "Lab Report",
      status: "Analyzed",
    },
    {
      id: 2,
      title: "X-Ray Chest",
      date: "2025-01-10",
      type: "Imaging",
      status: "Analyzed",
    },
    {
      id: 3,
      title: "Prescription - Dr. Khan",
      date: "2025-01-05",
      type: "Prescription",
      status: "Pending",
    },
  ]);

  const stats = [
    {
      icon: FileText,
      label: "Total Reports",
      value: "24",
      trend: "+3 this month",
      color: "text-primary",
    },
    {
      icon: Activity,
      label: "Vitals Recorded",
      value: "156",
      trend: "+12 this week",
      color: "text-secondary",
    },
    {
      icon: TrendingUp,
      label: "Health Score",
      value: "85%",
      trend: "Excellent",
      color: "text-success",
    },
    {
      icon: Clock,
      label: "Last Upload",
      value: "2 days ago",
      trend: "Recent activity",
      color: "text-accent",
    },
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b glass-effect sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link to="/dashboard" className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <Heart className="w-5 h-5 text-primary-foreground" fill="currentColor" />
            </div>
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              HealthMate
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm">
              <Calendar className="w-4 h-4 mr-2" />
              Timeline
            </Button>
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={handleLogout}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8 animate-fade-in-up">
          <h1 className="text-4xl font-bold mb-2">Welcome back! 👋</h1>
          <p className="text-muted-foreground text-lg">
            Here's your health dashboard overview
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="p-6 glass-effect hover:shadow-md transition-smooth animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center ${stat.color}`}>
                  <stat.icon className="w-6 h-6" />
                </div>
              </div>
              <h3 className="text-2xl font-bold mb-1">{stat.value}</h3>
              <p className="text-sm text-muted-foreground mb-2">{stat.label}</p>
              <p className="text-xs text-muted-foreground">{stat.trend}</p>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Reports */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Recent Reports</h2>
              <Button className="gradient-primary">
                <Upload className="w-4 h-4 mr-2" />
                Upload Report
              </Button>
            </div>

            <div className="space-y-4">
              {reports.map((report) => (
                <Card
                  key={report.id}
                  className="p-6 glass-effect hover:shadow-md transition-smooth cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{report.title}</h3>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-sm text-muted-foreground">{report.type}</span>
                          <span className="text-sm text-muted-foreground">•</span>
                          <span className="text-sm text-muted-foreground">{report.date}</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          report.status === "Analyzed"
                            ? "bg-success/10 text-success"
                            : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {report.status}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">Quick Actions</h2>

            <Card className="p-6 glass-effect">
              <img
                src={dashboardImage}
                alt="Dashboard"
                className="w-full rounded-lg mb-4"
              />
              <div className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Manual Vitals
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Calendar className="w-4 h-4 mr-2" />
                  View Timeline
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Health Insights
                </Button>
              </div>
            </Card>

            <Card className="p-6 glass-effect border-primary/20">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Heart className="w-5 h-5 text-primary" />
                Health Tip
              </h3>
              <p className="text-sm text-muted-foreground">
                Regular health checkups help in early detection of potential health issues.
                Upload your reports to track your progress!
              </p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

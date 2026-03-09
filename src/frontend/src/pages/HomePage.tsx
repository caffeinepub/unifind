import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Link } from "@tanstack/react-router";

import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  CheckCircle,
  Clock,
  Package,
  Search,
} from "lucide-react";
import { motion } from "motion/react";
import { useStats } from "../hooks/useQueries";

export default function HomePage() {
  const { data: stats } = useStats();

  const statCards = [
    {
      label: "Items Reported Lost",
      value: stats?.lost ?? 0,
      icon: AlertTriangle,
      color: "text-red-500",
      bg: "bg-red-50",
    },
    {
      label: "Items Found",
      value: stats?.found ?? 0,
      icon: Package,
      color: "text-teal-600",
      bg: "bg-teal-50",
    },
    {
      label: "Reunited",
      value: stats?.resolved ?? 0,
      icon: CheckCircle,
      color: "text-primary",
      bg: "bg-primary/10",
    },
  ];

  return (
    <div className="pb-8">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-foreground via-foreground to-primary/80 text-white">
        {/* Background decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-primary blur-3xl" />
          <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-teal-400 blur-3xl" />
        </div>

        <div className="relative container mx-auto px-4 py-16 md:py-24">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-white" />
                </div>
                <span className="text-white/70 text-sm font-medium tracking-wide uppercase">
                  Chandigarh University – Lost & Found
                </span>
              </div>

              <h1 className="font-display text-4xl md:text-6xl font-bold mb-4 leading-tight">
                Reuniting Students
                <br />
                <span className="text-primary">with Their Belongings</span>
              </h1>

              <p className="text-white/70 text-lg md:text-xl mb-8 max-w-2xl leading-relaxed">
                Lost something on the CU campus? Found an item? Report it here
                and help your fellow Chandigarh University students get their
                belongings back.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <Link to="/report" data-ocid="home.report_lost_button">
                  <Button
                    size="lg"
                    className="bg-destructive hover:bg-destructive/90 text-white gap-2 px-6"
                  >
                    <AlertTriangle className="w-5 h-5" />
                    Report Lost Item
                  </Button>
                </Link>
                <Link to="/report" data-ocid="home.report_found_button">
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/30 text-white bg-white/10 hover:bg-white/20 gap-2 px-6"
                  >
                    <Package className="w-5 h-5" />
                    Report Found Item
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-8 relative z-10">
        <div className="grid grid-cols-3 gap-3 md:gap-6">
          {statCards.map(({ label, value, icon: Icon, color, bg }, i) => (
            <motion.div
              key={label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className="bg-white shadow-card border-border">
                <CardContent className="p-4 md:p-6">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}
                    >
                      <Icon className={`w-5 h-5 ${color}`} />
                    </div>
                    <div>
                      <div className="font-display text-2xl md:text-3xl font-bold text-foreground">
                        {value ?? 0}
                      </div>
                      <div className="text-xs md:text-sm text-muted-foreground leading-tight">
                        {label}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Quick Action Cards */}
      <section className="container mx-auto px-4 mt-8 md:mt-12">
        <div className="grid md:grid-cols-2 gap-4 md:gap-6">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="group bg-gradient-to-br from-red-50 to-orange-50 border border-red-100 hover:shadow-card-hover transition-shadow overflow-hidden cursor-pointer">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
                    <AlertTriangle className="w-7 h-7 text-red-500" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-red-300 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                </div>
                <h2 className="font-display text-xl font-bold text-foreground mb-2">
                  I Lost Something
                </h2>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  Report a lost item and get notified when someone finds it on
                  campus.
                </p>
                <div className="flex gap-2">
                  <Link to="/report">
                    <Button
                      size="sm"
                      className="bg-red-500 hover:bg-red-600 text-white"
                      data-ocid="home.report_lost_button"
                    >
                      Report Lost Item
                    </Button>
                  </Link>
                  <Link to="/lost">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-200 text-red-600 hover:bg-red-50"
                    >
                      Browse Lost Items
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <Card className="group bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 hover:shadow-card-hover transition-shadow overflow-hidden cursor-pointer">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-teal-100 flex items-center justify-center">
                    <Package className="w-7 h-7 text-teal-600" />
                  </div>
                  <ArrowRight className="w-5 h-5 text-teal-300 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h2 className="font-display text-xl font-bold text-foreground mb-2">
                  I Found Something
                </h2>
                <p className="text-muted-foreground text-sm mb-4 leading-relaxed">
                  Help reunite a fellow student with their lost item by
                  reporting what you found.
                </p>
                <div className="flex gap-2">
                  <Link to="/report">
                    <Button
                      size="sm"
                      className="bg-teal-600 hover:bg-teal-700 text-white"
                      data-ocid="home.report_found_button"
                    >
                      Report Found Item
                    </Button>
                  </Link>
                  <Link to="/found">
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-teal-200 text-teal-600 hover:bg-teal-50"
                    >
                      Browse Found Items
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* How it Works */}
      <section className="container mx-auto px-4 mt-12 md:mt-16">
        <div className="text-center mb-8">
          <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-2">
            How UniFind Works
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Simple steps to report or find your belongings on Chandigarh
            University campus
          </p>
        </div>

        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              step: "01",
              icon: Search,
              title: "Report or Browse",
              desc: "Submit a lost/found report or browse through existing reports to find your item.",
              color: "text-primary",
              bg: "bg-primary/10",
            },
            {
              step: "02",
              icon: Clock,
              title: "Get Notified",
              desc: "Receive instant notifications when a matching item is reported by someone else.",
              color: "text-amber-600",
              bg: "bg-amber-50",
            },
            {
              step: "03",
              icon: CheckCircle,
              title: "Connect & Reunite",
              desc: "Contact the finder or owner through the app and arrange to collect your item.",
              color: "text-emerald-600",
              bg: "bg-emerald-50",
            },
          ].map(({ step, icon: Icon, title, desc, color, bg }) => (
            <motion.div
              key={step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <Card className="bg-white border-border shadow-card text-center p-6 h-full">
                <div
                  className={`w-14 h-14 rounded-2xl ${bg} flex items-center justify-center mx-auto mb-4`}
                >
                  <Icon className={`w-7 h-7 ${color}`} />
                </div>
                <div className="text-xs font-mono font-bold text-muted-foreground mb-2">
                  {step}
                </div>
                <h3 className="font-display font-semibold text-foreground mb-2">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {desc}
                </p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

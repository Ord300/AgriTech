"use client"

import { useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ORDER_STATUS_LABELS, type Order } from "@/lib/types"
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
} from "recharts"

const PALETTE = ["#a3e635", "#34d399", "#fbbf24", "#2dd4bf", "#f472b6", "#818cf8"]
const STATUS_COLORS: Record<Order["status"], string> = {
  pending: "#fbbf24",
  confirmed: "#2dd4bf",
  delivered: "#a3e635",
  cancelled: "#f43f5e",
}

const tooltipStyle = {
  backgroundColor: "rgba(13, 31, 22, 0.95)",
  borderColor: "rgba(163, 230, 53, 0.15)",
  borderRadius: "10px",
  color: "#ecfdf5",
  fontSize: "12px",
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
} as const

const axisTick = { fill: "rgba(236,253,245,0.6)", fontSize: 11 } as const

const renderPieLabel = ({ cx, cy, midAngle, outerRadius, name, value }: any) => {
  const RADIAN = Math.PI / 180
  const radius = outerRadius + 16
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)
  return (
    <text
      x={x}
      y={y}
      fill="rgba(236,253,245,0.85)"
      textAnchor={x > cx ? "start" : "end"}
      dominantBaseline="central"
      fontSize={11}
      fontWeight={500}
    >
      {`${name}: ${value}`}
    </text>
  )
}

interface FarmerSalesChartsProps {
  orders: Order[]
}

export function FarmerSalesCharts({ orders }: FarmerSalesChartsProps) {
  const activeOrders = useMemo(
    () => orders.filter((o) => o.status !== "cancelled"),
    [orders],
  )

  // Revenus groupés par jour de commande (chronologique)
  const revenueByDay = useMemo(() => {
    const buckets = new Map<string, number>()
    for (const order of activeOrders) {
      const key = order.createdAt.split("T")[0]
      buckets.set(key, (buckets.get(key) ?? 0) + order.totalPrice)
    }
    return Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, revenue]) => ({
        day: new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }),
        revenue: Math.round(revenue * 100) / 100,
      }))
  }, [activeOrders])

  // Quantités vendues par produit
  const salesByProduct = useMemo(() => {
    const buckets = new Map<string, number>()
    for (const order of activeOrders) {
      buckets.set(order.productName, (buckets.get(order.productName) ?? 0) + order.quantity)
    }
    return Array.from(buckets.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 8)
  }, [activeOrders])

  // Commandes par statut
  const ordersByStatus = useMemo(() => {
    const buckets = new Map<Order["status"], number>()
    for (const order of orders) {
      buckets.set(order.status, (buckets.get(order.status) ?? 0) + 1)
    }
    return Array.from(buckets.entries()).map(([status, value]) => ({
      name: ORDER_STATUS_LABELS[status],
      status,
      value,
    }))
  }, [orders])

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      {/* Évolution des revenus */}
      <Card className="border-white/5 bg-card/60 shadow-lg backdrop-blur-xl lg:col-span-2">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-foreground">Évolution des revenus</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Chiffre d&apos;affaires par jour de commande
          </CardDescription>
        </CardHeader>
        <CardContent>
          {revenueByDay.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Aucune vente enregistrée pour le moment.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueByDay} margin={{ top: 8, right: 8, left: -14, bottom: 0 }}>
                <defs>
                  <linearGradient id="farmerRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#a3e635" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#34d399" stopOpacity={0.03} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="day" tick={axisTick} axisLine={false} tickLine={false} dy={6} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v) => `${v} €`} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: "#fff" }}
                  labelStyle={{ color: "rgba(236,253,245,0.7)", marginBottom: 4 }}
                  cursor={{ stroke: "rgba(163,230,53,0.4)", strokeWidth: 1 }}
                  formatter={(value: any) => [`${value} €`, "Revenu"]}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#a3e635"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#farmerRevenue)"
                  name="Revenu (€)"
                  dot={{ r: 3, fill: "#a3e635", strokeWidth: 0 }}
                  activeDot={{ r: 5, fill: "#a3e635", stroke: "rgba(255,255,255,0.3)", strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Ventes par produit */}
      <Card className="border-white/5 bg-card/60 shadow-lg backdrop-blur-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-foreground">Ventes par produit</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Quantités vendues (top 8)
          </CardDescription>
        </CardHeader>
        <CardContent>
          {salesByProduct.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Aucune vente enregistrée pour le moment.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={salesByProduct} margin={{ top: 8, right: 8, left: -18, bottom: 0 }}>
                <defs>
                  <linearGradient id="farmerBar" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#34d399" stopOpacity={1} />
                    <stop offset="100%" stopColor="#2dd4bf" stopOpacity={0.55} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" vertical={false} />
                <XAxis dataKey="name" tick={axisTick} axisLine={false} tickLine={false} dy={6} />
                <YAxis tick={axisTick} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  itemStyle={{ color: "#fff" }}
                  labelStyle={{ color: "rgba(236,253,245,0.7)", marginBottom: 4 }}
                  cursor={{ fill: "rgba(255,255,255,0.04)" }}
                  formatter={(value: any) => [`${value}`, "Quantité"]}
                />
                <Bar dataKey="quantity" fill="url(#farmerBar)" name="Quantité" radius={[5, 5, 0, 0]} barSize={28} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      {/* Commandes par statut */}
      <Card className="border-white/5 bg-card/60 shadow-lg backdrop-blur-xl">
        <CardHeader className="pb-2">
          <CardTitle className="text-base text-foreground">Commandes par statut</CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Distribution de vos commandes
          </CardDescription>
        </CardHeader>
        <CardContent>
          {ordersByStatus.length === 0 ? (
            <p className="py-12 text-center text-sm text-muted-foreground">
              Aucune commande pour le moment.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={ordersByStatus}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderPieLabel}
                  innerRadius={55}
                  outerRadius={72}
                  paddingAngle={4}
                  dataKey="value"
                  stroke="none"
                >
                  {ordersByStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.status] ?? PALETTE[index % PALETTE.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} itemStyle={{ color: "#fff" }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

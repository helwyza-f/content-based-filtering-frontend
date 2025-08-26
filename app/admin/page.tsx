"use client";

import { use, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function AdminDashboardPage() {
  const supabase = createClient();
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalProducts, setTotalProducts] = useState(0);
  const [recentUsers, setRecentUsers] = useState<any[]>([]);
  const [recentProducts, setRecentProducts] = useState<any[]>([]);
  const router = useRouter();
  useEffect(() => {
    const fetchData = async () => {
      const { count: userCount } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true });
      const { count: productCount } = await supabase
        .from("products")
        .select("*", { count: "exact", head: true });

      setTotalUsers(userCount || 0);
      setTotalProducts(productCount || 0);

      const { data: users } = await supabase
        .from("profiles")
        .select("id, first_name, last_name, role")
        .order("id", { ascending: false })
        .limit(5);

      const { data: products } = await supabase
        .from("products")
        .select("id, product_display_name, year, base_colour")
        .order("id", { ascending: false })
        .limit(5);

      setRecentUsers(users || []);
      setRecentProducts(products || []);
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">Admin Dashboard</h1>

      {/* Statistik Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Users</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">{totalUsers}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Total Products</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-bold">
            {totalProducts}
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Users</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recentUsers.map((user) => (
              <li key={user.id} className="flex justify-between">
                <span>
                  {user.first_name} {user.last_name}
                </span>
                <span className="text-sm text-gray-500">{user.role}</span>
              </li>
            ))}
          </ul>
          <Button
            className="mt-3"
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/users")}
          >
            Manage Users
          </Button>
        </CardContent>
      </Card>

      {/* Recent Products */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Products</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {recentProducts.map((p) => (
              <li key={p.id} className="flex justify-between">
                <span>{p.product_display_name}</span>
                <span className="text-sm text-gray-500">{p.year}</span>
              </li>
            ))}
          </ul>
          <Button
            className="mt-3"
            variant="outline"
            size="sm"
            onClick={() => router.push("/admin/products")}
          >
            Manage Products
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, Plus, Edit, Trash2, Package } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { MoreVertical } from "lucide-react"
import Image from "next/image"

// Mock data
const products = [
  {
    id: 1,
    name: "School Uniform (Junior)",
    description: "Complete junior secondary school uniform set",
    price: 15000,
    category: "Uniforms",
    image: "/school-uniform.jpg",
    inStock: true,
    stock: 45,
    sold: 155,
  },
  {
    id: 2,
    name: "School Uniform (Senior)",
    description: "Complete senior secondary school uniform set",
    price: 18000,
    category: "Uniforms",
    image: "/school-uniform-senior.jpg",
    inStock: true,
    stock: 32,
    sold: 98,
  },
  {
    id: 3,
    name: "Mathematics Textbook JSS 1",
    description: "Approved mathematics textbook for JSS 1 students",
    price: 3500,
    category: "Books",
    image: "/mathematics-textbook.png",
    inStock: true,
    stock: 120,
    sold: 230,
  },
]

const orders = [
  {
    id: 1,
    orderNumber: "ORD-2024-001",
    customer: "Mr. Chukwuma Obi",
    items: 3,
    total: 25000,
    status: "pending",
    date: "2024-03-10",
  },
  {
    id: 2,
    orderNumber: "ORD-2024-002",
    customer: "Mrs. Halima Mohammed",
    items: 2,
    total: 18500,
    status: "completed",
    date: "2024-03-09",
  },
]

export default function AdminMarketplacePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Marketplace Management</h1>
          <p className="text-muted-foreground">Manage products and orders</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Product
        </Button>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Products</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
            <p className="text-xs text-muted-foreground">Across all categories</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Orders</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">₦2.4M</div>
            <p className="text-xs text-muted-foreground">This academic session</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Products</CardTitle>
              <CardDescription>Manage your product inventory</CardDescription>
            </div>
            <div className="relative w-full md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search products..." className="pl-8" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {products.map((product) => (
              <div key={product.id} className="flex items-center gap-4 rounded-lg border p-4">
                <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md">
                  <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                </div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-semibold">{product.name}</h3>
                      <p className="text-sm text-muted-foreground">{product.description}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="outline">{product.category}</Badge>
                    <span className="font-semibold">₦{product.price.toLocaleString()}</span>
                    <span className="text-muted-foreground">Stock: {product.stock}</span>
                    <span className="text-muted-foreground">Sold: {product.sold}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
          <CardDescription>Latest marketplace orders</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="px-4 py-3 text-left text-sm font-medium">Order Number</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Items</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b">
                    <td className="px-4 py-3 text-sm font-medium">{order.orderNumber}</td>
                    <td className="px-4 py-3 text-sm">{order.customer}</td>
                    <td className="px-4 py-3 text-sm">{order.items} items</td>
                    <td className="px-4 py-3 text-sm font-semibold">₦{order.total.toLocaleString()}</td>
                    <td className="px-4 py-3 text-sm">{new Date(order.date).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm">
                      <Badge variant={order.status === "completed" ? "default" : "secondary"}>{order.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

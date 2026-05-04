import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ShoppingCart, Package } from "lucide-react"
import Image from "next/image"

// Mock data
const recommendedProducts = [
  {
    id: 1,
    name: "Mathematics Textbook JSS 1",
    description: "Approved mathematics textbook for JSS 1 students",
    price: 3500,
    category: "Books",
    image: "/mathematics-textbook.png",
    inStock: true,
  },
  {
    id: 2,
    name: "English Language Textbook JSS 1",
    description: "Approved English language textbook for JSS 1",
    price: 3200,
    category: "Books",
    image: "/english-textbook.png",
    inStock: true,
  },
  {
    id: 3,
    name: "School Bag",
    description: "Durable school bag with school logo",
    price: 8500,
    category: "Accessories",
    image: "/school-bag.jpg",
    inStock: true,
  },
]

const myOrders = [
  {
    id: 1,
    orderNumber: "ORD-2024-045",
    items: 2,
    total: 6700,
    status: "delivered",
    date: "2024-02-15",
  },
]

export default function StudentMarketplacePage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">School Marketplace</h1>
          <p className="text-muted-foreground">Purchase school items and track your orders</p>
        </div>
        <Button>
          <ShoppingCart className="mr-2 h-4 w-4" />
          View Full Marketplace
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>My Orders</CardTitle>
          <CardDescription>Track your marketplace orders</CardDescription>
        </CardHeader>
        <CardContent>
          {myOrders.length > 0 ? (
            <div className="space-y-4">
              {myOrders.map((order) => (
                <div key={order.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div className="flex items-center gap-4">
                    <Package className="h-8 w-8 text-muted-foreground" />
                    <div>
                      <p className="font-semibold">{order.orderNumber}</p>
                      <p className="text-sm text-muted-foreground">
                        {order.items} items • ₦{order.total.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">{new Date(order.date).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <Badge variant={order.status === "delivered" ? "default" : "secondary"}>{order.status}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No orders yet</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recommended for You</CardTitle>
          <CardDescription>Items recommended for your class</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {recommendedProducts.map((product) => (
              <Card key={product.id} className="overflow-hidden">
                <div className="relative aspect-square">
                  <Image src={product.image || "/placeholder.svg"} alt={product.name} fill className="object-cover" />
                </div>
                <CardHeader>
                  <CardTitle className="text-lg">{product.name}</CardTitle>
                  <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Badge variant="outline">{product.category}</Badge>
                  <div className="text-2xl font-bold">₦{product.price.toLocaleString()}</div>
                </CardContent>
                <CardFooter>
                  <Button className="w-full">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    Add to Cart
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

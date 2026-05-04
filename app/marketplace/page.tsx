import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Search, ShoppingCart } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
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
  },
  {
    id: 4,
    name: "English Language Textbook JSS 1",
    description: "Approved English language textbook for JSS 1",
    price: 3200,
    category: "Books",
    image: "/english-textbook.png",
    inStock: true,
    stock: 95,
  },
  {
    id: 5,
    name: "School Bag",
    description: "Durable school bag with school logo",
    price: 8500,
    category: "Accessories",
    image: "/school-bag.jpg",
    inStock: true,
    stock: 60,
  },
  {
    id: 6,
    name: "Sports Kit",
    description: "Complete sports uniform for physical education",
    price: 12000,
    category: "Sports",
    image: "/generic-sports-uniform.png",
    inStock: false,
    stock: 0,
  },
]

export default function MarketplacePage() {
  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="space-y-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-balance">School Marketplace</h1>
              <p className="text-muted-foreground">Purchase school items, uniforms, and books</p>
            </div>
            <Button>
              <ShoppingCart className="mr-2 h-4 w-4" />
              View Cart (0)
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <CardTitle>Browse Products</CardTitle>
                <div className="flex gap-2">
                  <div className="relative flex-1 md:w-64">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search products..." className="pl-8" />
                  </div>
                  <Select defaultValue="all">
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      <SelectItem value="uniforms">Uniforms</SelectItem>
                      <SelectItem value="books">Books</SelectItem>
                      <SelectItem value="accessories">Accessories</SelectItem>
                      <SelectItem value="sports">Sports</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {products.map((product) => (
                  <Card key={product.id} className="overflow-hidden">
                    <div className="relative aspect-square">
                      <Image
                        src={product.image || "/placeholder.svg"}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                      {!product.inStock && (
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                          <Badge variant="destructive">Out of Stock</Badge>
                        </div>
                      )}
                    </div>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <CardDescription className="line-clamp-2">{product.description}</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{product.category}</Badge>
                        {product.inStock && (
                          <span className="text-sm text-muted-foreground">{product.stock} in stock</span>
                        )}
                      </div>
                      <div className="text-2xl font-bold">₦{product.price.toLocaleString()}</div>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full" disabled={!product.inStock}>
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        {product.inStock ? "Add to Cart" : "Out of Stock"}
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

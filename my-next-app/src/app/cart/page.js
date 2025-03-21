"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import Link from "next/link"
import { Minus, Plus, X, ArrowLeft } from "lucide-react"
import Header from "@/app/Components/header"

export default function CartPage() {
  const [cartItems, setCartItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

// Fetch cart items with product details
useEffect(() => {
  const fetchCart = async () => {
    try {
      setLoading(true)
      console.log("Fetching cart from:", `${process.env.NEXT_PUBLIC_API_URL}/cart`)

      // First, get the basic cart items
      const cartResponse = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/cart`, {
        withCredentials: true,
      })

      // Then, for each cart item, get the product details
      const cartItemsWithProducts = await Promise.all(
        cartResponse.data.map(async (item) => {
          try {
            const productResponse = await axios.get(
              `${process.env.NEXT_PUBLIC_API_URL}/products/${item.product_id}`,
              { withCredentials: true },
            )
            return {
              ...item,
              Product: productResponse.data,
              subtotal: productResponse.data.price * item.quantity,
            }
          } catch (err) {
            console.error(`Error fetching product ${item.product_id}:`, err)
            return {
              ...item,
              Product: null,
              subtotal: 0,
            }
          }
        }),
      )

      console.log("Cart items with products:", cartItemsWithProducts)
      setCartItems(cartItemsWithProducts || [])
    } catch (err) {
      console.error("Error fetching cart:", err)
      setError("Failed to load cart items. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  fetchCart()
}, [])

  // Update quantity
  const updateQuantity = async (productId, newQuantity) => {
    if (newQuantity < 1) return

    try {
      // Update locally first for better UX
      setCartItems((prevItems) =>
        prevItems.map((item) => (item.product_id === productId ? { ...item, quantity: newQuantity } : item)),
      )

    // Then update on server
    await axios.put(
      `${process.env.NEXT_PUBLIC_API_URL}/cart/${productId}`,
      {
        quantity: newQuantity,
      },
      {
        withCredentials: true,
      },
    )
  } catch (err) {
    console.error("Error updating quantity:", err)
    // Revert on failure by refetching
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/cart/with-products`, {
        withCredentials: true,
      })
      setCartItems(response.data.items || [])
    } catch (fetchErr) {
      console.error("Error refetching cart:", fetchErr)
    }
  }
}

  // Remove from cart
  const removeFromCart = async (productId) => {
    try {
      await axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/cart/${productId}`, {
        withCredentials: true, // Enable credentials
      })

      // Update local state
      setCartItems((prevItems) => prevItems.filter((item) => item.product_id !== productId))
    } catch (err) {
      console.error("Error removing item:", err)
    }
  }

  // Calculate totals dynamically (based on the prices of products)
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.Product?.price || 0;
    return sum + (price * item.quantity);
  }, 0);

   // Format price to 2 decimal places
   const formatPrice = (price) => {
    return (Math.round(price * 100) / 100).toFixed(2)
  }

  const displayItems = cartItems;
  const displaySubtotal = subtotal;
  const displayTotal = displaySubtotal;// No delivery fee added here as per the previous change

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header Component */}
      <Header />

      {/* Page Title Banner */}
      <div className="bg-[#A68F7B] h-[30vh] flex items-center justify-center mt-20">
        <h1 className="text-white text-5xl sm:text-6xl font-bold text-center">Your Cart</h1>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8 -mt-10">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center text-gray-600 mb-6 bg-white px-4 py-2 rounded-lg shadow-sm">
          <ArrowLeft size={16} className="mr-2" />
          <span>Continue Shopping</span>
        </Link>

        {/* Cart Content */}
        <div className="grid md:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="md:col-span-2 bg-white rounded-lg p-6 shadow-lg">
            {loading ? (
              <p className="text-center py-8">Loading your cart...</p>
            ) : error ? (
              <p className="text-center text-red-500 py-8">{error}</p>
            ) : displayItems.length === 0 ? (
              <div className="text-center py-8">
                <p className="mb-4 text-lg">Your cart is empty</p>
                <Link href="/products" className="text-[#4A8C8C] hover:underline font-medium">
                  Continue shopping
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {displayItems.map((item) => (
                  <div key={item.product_id} className="flex items-center border-b pb-6">
                    <div className="ml-4 flex-grow">
                      <div className="flex justify-between">
                        <div>
                          <h3 className="text-gray-700 font-medium">
                            {item.Product?.name || "Product name unavailable"}
                          </h3>
                        </div>
                        <button
                          onClick={() => removeFromCart(item.product_id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X size={16} />
                        </button>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="flex items-center border rounded-md">
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="px-3 py-1">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                        <span className="font-medium">
                          ${item.Product?.price || "0.00"}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-2xl font-bold mb-6 text-gray-800">Order Summary</h2>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-medium">${displaySubtotal}</span>
                </div>
                <div className="border-t pt-4 mt-4">
                  <div className="flex justify-between font-bold text-xl">
                    <span>Total</span>
                    <span>${displayTotal}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button className="w-full bg-[#4A8C8C] text-white py-3 rounded-md hover:bg-[#3a7070] transition mt-6 font-medium text-lg">
                  Checkout
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

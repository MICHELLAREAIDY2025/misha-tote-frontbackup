"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import Sidebar from "@/Components/sidebar";
import { FaEye, FaEdit, FaTrash } from "react-icons/fa";

const Orders = () => {
    const [orders, setOrders] = useState([]);
    const [error, setError] = useState("");

    const getOrders = async () => {
        try {
            const response = await axios.get("http://localhost:5000/api/orders/", {
                withCredentials: true, // Ensure cookies are sent with the request
            });

            if (response.status === 200) {
                setOrders(response.data); // Set the orders received from the API
            } else {
                setError(`Unexpected response status: ${response.status}`);
            }
        } catch (err) {
            console.error("Error fetching orders:", err);
            setError("Unable to get orders");
        }
    };


    //delete
    const deleteOrder = async (orderId) => {
        try {
            const response = await axios.delete(`http://localhost:5000/api/orders/${orderId}`, {
                withCredentials: true, // Ensure cookies are sent with the request
            });

            if (response.status === 200) {
                
                setOrders((prevOrders) => prevOrders.filter((order) => order.id !== orderId));
            }
        } catch (err) {
            console.error("Error deleting order:", err);
            setError("Unable to delete order");
        }
    };
    useEffect(() => {
        getOrders();
    }, []);

    return (
        <div className="flex">
            <Sidebar />
            <div className="flex-1 p-6">
                {error && <p className="text-red-500">{error}</p>}
                <table className="min-w-full table-auto border-collapse bg-white shadow-md rounded-lg lg:mt-20">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700 ">User Name</th>
                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Status</th>
                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Total Price</th>
                            <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.map((order) => (
                            <tr key={order.id} className="border-b hover:bg-gray-50">
                                <td className="px-6 py-4 text-sm text-gray-900 text-center">{order.user?.name || order.user_id || "N/A"}</td>
                                <td className="px-6 py-4 text-sm text-gray-700 text-center">{order.status}</td>
                                <td className="px-6 py-4 text-sm text-gray-700 text-center">${order.total_price}</td>
                                <td className="px-6 py-4 text-sm">
                                    <div className="flex justify-center items-center space-x-4">
                                        <button className="text-blue-500 hover:text-blue-700">
                                            <FaEye className="h-5 w-5" />
                                        </button>

                                        <button
                                            className="text-red-500 hover:text-red-700"
                                            onClick={() => deleteOrder(order.id)}
                                        >
                                            <FaTrash className="h-5 w-5" />
                                        </button>
                                    </div>
                                </td>

                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Orders;

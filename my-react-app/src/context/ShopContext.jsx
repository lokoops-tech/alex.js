import React, { createContext, useState } from "react";
import all from "../Assets/all.js";

export const shopContext = createContext(null);

const getDefaultCart = () => {
    let cart = {};
    for (let index = 0; index < all.length; index++) {
        cart[all[index].id] = 0;
    }
    return cart;
};

const ShopContextProvider = (props) => {
 const [cartItems, setCartItems]=useState(getDefaultCart());

    const addToCart = (itemId) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: prev[itemId] + 1
        }));
    };

    const removeFromCart = (itemId) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: prev[itemId] > 0 ? prev[itemId] - 1 : 0
        }));
    };

    const getTotalCartAmount = () => {
        let totalAmount = 0;
        for (const itemId in cartItems) {
            if (cartItems[itemId] > 0) {
                const itemInfo = all.find((product) => product.id === parseInt(itemId));
                if (itemInfo) {
                    totalAmount += itemInfo.new_price * cartItems[itemId];
                }
            }
        }
        return totalAmount;
    };

    const getTotalCartItems = () => {
        return Object.values(cartItems).reduce((total, qty) => total + qty, 0);
    };

    // Add utility functions for cart management
    const clearCart = () => {
        setCartItems(getDefaultCart());
    };

    const updateCartItemQuantity = (itemId, quantity) => {
        setCartItems((prev) => ({
            ...prev,
            [itemId]: Math.max(0, quantity) // Ensure quantity isn't negative
        }));
    };

    const isItemInCart = (itemId) => {
        return cartItems[itemId] > 0;
    };

    const contextValue = {
        all,
        cartItems,
        addToCart,
        removeFromCart,
        getTotalCartAmount,
        getTotalCartItems,
        clearCart,
        updateCartItemQuantity,
        isItemInCart
    };

    return (
        <shopContext.Provider value={contextValue}>
            {props.children}
        </shopContext.Provider>
    );
};

export default ShopContextProvider;
import React, { useState, useContext } from 'react';
import { shopContext } from '../../context/ShopContext';
import star_icon from '../../Assets/star_icon.png';
import star_dull_icon from '../../Assets/star_dull_icon.png';
import './ProductDisplay.css';

const ProductDisplay = ({ product }) => {
    const { 
        cartItems, 
        addToCart, 
        removeFromCart,
        updateCartItemQuantity 
    } = useContext(shopContext);

    const [selectedImage, setSelectedImage] = useState(product.image);
    const [addedToCart, setAddedToCart] = useState(false);
    
    // Get current quantity from cartItems
    const currentQuantity = cartItems[product.id] || 0;

    const handleAddToCart = () => {
        addToCart(product.id);
        setAddedToCart(true);
        setTimeout(() => setAddedToCart(false), 2000);
    };

    const handleQuantityChange = (change) => {
        const newQuantity = currentQuantity + change;
        if (newQuantity >= 0 && newQuantity <= 10000) {
            updateCartItemQuantity(product.id, newQuantity);
        }
    };

    const renderStars = (rating, totalStars = 5) => {
        return Array(totalStars).fill(0).map((_, index) => (
            <img 
                key={index}
                src={index < rating ? star_icon : star_dull_icon}
                alt={index < rating ? "star" : "dull star"}
            />
        ));
    };

    return (
        <div className="productdisplay">
            <div className="productdisplay-left">
                <div className="productdisplay-img-list">
                    {[product.image, product.image, product.image, product.image].map((img, index) => (
                        <img 
                            key={index}
                            src={img}
                            alt={`${product.name} view ${index + 1}`}
                            onClick={() => setSelectedImage(img)}
                            className={selectedImage === img ? 'selected' : ''}
                        />
                    ))}
                </div>
                <div className="productdisplay-image">
                    <img 
                        className="productdisplay-main-img" 
                        src={selectedImage} 
                        alt={product.name} 
                    />
                </div>
            </div>
            <div className="productdisplay-right">
                <h1>{product.name}</h1>
                
                <div className="productdisplay-star">
                    {renderStars(4)}
                    <p>(122)</p>
                </div>

                <div className="productdisplay-right-prices">
                    <div className="old-price">
                        Ksh {product.old_price}
                    </div>
                    <div className="new-price">
                        Ksh {product.new_price}
                    </div>
                    <div className="savings">
                        Save Ksh {product.new_price - product.old_price}
                    </div>
                </div>

                <div className="product-display-description">
                    <h3>Product Description</h3>
                    <hr />
                    <p>Lorem ipsum dolor sit amet consectetur adipisicing elit.<br></br> Rem facilis eos modi, fuga doloribus <br></br>aut quasi quod repudiandae,
                     deserunt impedit voluptatibus. Odit eligendi <br></br>et vero eaque, dolore incidunt deserunt quae!</p>
                </div>

                {currentQuantity > 0 ? (
                    <div className="product-display-quantity">
                        <button 
                            onClick={() => handleQuantityChange(-1)}
                            className="quantity-btn"
                            disabled={currentQuantity <= 0}
                        >
                            -
                        </button>
                        <span className="quantity-value">{currentQuantity}</span>
                        <button 
                            onClick={() => handleQuantityChange(1)}
                            className="quantity-btn"
                            disabled={currentQuantity >= 10000}
                        >
                            +
                        </button>
                    </div>
                ) : (
                    <>
                    <button 
                        className={`add-to-cart-btn ${addedToCart ? 'added' : ''}`}
                        onClick={handleAddToCart}

                    >
                        {addedToCart ?`SELECT ITEM` :'ADD TO CART' }
                          
                
                    </button>
                       OR
                      
        {/*<a href="https://api.whatsapp.com/send?phone=254718315313&text=Welcome%20to%20gich%20-tech%2C%20order%20any%20product%20now" target="_blank" rel="noopener noreferrer" className="whatsapp-link">
             <button style="background-color: #25D366; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; 
             display: flex; align-items: center; gap: 10px;">
           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="white">
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.625.846 5.059 2.284 7.034L.784 23.456l4.5-1.442C7.236 23.306 9.546 24 12 24c6.627 0 12-5.373 12-
            12S18.627 0 12 0zm.054 19.02c-1.807 0-3.56-.491-5.09-1.421l-3.555 1.141 1.163-3.471a6.993 6.993 0 01-1.532-4.39c0-3.86 3.141-7 7.014-7 3.873 0
             7.014 3.14 7.014 7s-3.141 7-7.014 7z"/>
        </svg>
        Order on WhatsApp
    </button>
</a>*/}
                    
                    </>
                )}
            

                {currentQuantity > 0 && (
                    <div className="cart-status">
                        {currentQuantity} item{currentQuantity > 1 ? 's' : ''} in cart
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductDisplay;
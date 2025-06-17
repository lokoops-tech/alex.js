import React from "react";
import { useContext } from "react";
import { shopContext } from "../context/ShopContext";
import dropdown_icon from '../Assets/dropdown_icon.png';
import Item from "../components/Item/Item";
import './css/shop_category.css';

const ShopCategory = (props) => {
    const { all } = useContext(shopContext);
    
    // Filter products by category and count them
    const categoryProducts = all.filter(item => item.category === props.category);
    const productCount = categoryProducts.length;

    return (
        <div className="shop-category">
            {props.banner && <img src={props.banner} alt={`${props.category} banner`} />}

            <div className="shop">
                <div className="shopcategory-indexsort">
                    <p>
                        <span>showing 1-{Math.min(12, productCount)}</span> out of {productCount} products
                    </p>
                    <div className="shopcategory-sort">
                        sort by <img src={dropdown_icon} alt="" />
                    </div>
                </div>
                
                <div className="shopcategory-products">
                    {categoryProducts.map((item) => (
                        <Item
                            key={item.id} // Assuming each item has an id in your data
                            id={item.id}  // Pass the id to the Item component
                            name={item.name}
                            image={item.image}
                            category={item.category}
                            old_price={item.old_price}
                            new_price={item.new_price}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ShopCategory;


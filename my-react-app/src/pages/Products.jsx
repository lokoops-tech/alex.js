import React, { useContext } from "react";
import { shopContext } from "../context/ShopContext";
import { useParams } from "react-router-dom";
import BreadCrum from "../components/Breadcrums/Breadcrum";
import Describe from "../components/Descriptionbox/DescriptionBox";
//import Related from "../components/relatedProducts/relatedProducts";
import ProductDisplay from "../components/productDisplay/productDisplay";


const Products = () =>{
    const {all}= useContext (shopContext);
    const {productId} =useParams();
    const product= all.find((e) =>e.id ===Number(productId));

    if(!product){
      return <div className="container">product not found</div>
    }
    return(
        <div>
          <BreadCrum product={product}/>
          <ProductDisplay product={product}/>
          <Describe/>
          </div>
          //<Related/>
       
    )
}
export default Products;
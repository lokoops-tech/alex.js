import React from "react";
import Hero from "./Hero";
import Popular from "../components/popular/Popular";
import Offers from "../components/offers/Offer";
import New from "../components/NewColections/NewCollection";
import News from "../components/NewsLatter/NewsLatter";

const Shop = () =>{
return(
<div>
    <Hero/>
    <Popular/>
    <Offers/>
    <New/>
    <News/>
    
</div>

)
}
export default Shop;
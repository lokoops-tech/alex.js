import './Offer.css'
import oraimo from'../../Assets/orimo_5.jpg'

const Offers=() =>{
    return(
        <div className="offers">
            <div className="offers-left">
                <h1>Best offers from Gich-Tech electronic</h1>
               
            </div>
            <div className="offers-rigth">
                <img src={oraimo}alt="" />

            </div>
            <div className="far-rigth">
            <h1>Buy now save, for new product</h1>
            <button>check now</button>
            </div>
          
        </div>
    )
}
export default Offers
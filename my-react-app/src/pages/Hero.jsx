import './Hero.css'
import gich  from'../Assets/gich.png'

const  Hero = () =>{

    return(
    <>
     <div className="container">
     <div className="hero-">
   <img src={gich} alt=" "/>
   </div>
        <div className="text-left">
        <h1> Looking for an online shop to get the best electronics,<br/><span>Gich-tech</span> is here to serve you.</h1>
       <br />
       <br />
       <button>order now</button>
        </div>
   <div className="hero-rigth">
   <img src={gich} alt="hero-image" />
   </div>
   </div>
   </>
    )
}
export default Hero;
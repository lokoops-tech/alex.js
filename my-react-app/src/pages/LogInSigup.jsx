import './LoginSignup.css'

function LoginSignup(){

    return(
        <>
        <div className="loginsignup">
       <div className="loginsignup-container">
        <h1>sign up</h1>
        <div className="loginsignup-fields">
            <input type="text"  placeholder="your Name"  id=''/>
            <input type="email" placeholder="youremail id" id=''/>
            <input type="password" placeholder="password" id=''/>
        </div>
        <button>continue</button>
        <p className="loginsignup-login"> Already have an acoount <span>click here</span></p>
        <div className="loginsignup-agree">
            <input type="checkbox"  id=''/>
            <p>By continuing you agree with our terms and conditions </p>
        </div>
    </div>
 </div>

        </>
    )
}
export default LoginSignup;
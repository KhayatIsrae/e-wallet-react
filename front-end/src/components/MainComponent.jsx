
import Header from "./Header";
import Footer from "./Footer";
import walletGif from "../assets/e-Wallet6.gif";

export default function MainComponent({ setShowLogin }) {
    return (
        <>
            <Header />
            <main>
                <section className="hero">
                    <div className="hero-content" id="main">
                        <h1>E-Wallet</h1>
                        <p>Gérez vos finances facilement et en toute sécurité. Simplifiez vos paiements et transactions grâce à notre solution moderne.</p>
                        <div className="buttons">
                            <button className="btn btn-primary" id="Loginbtn" onClick={() => setShowLogin(true)} >Login</button>
                            <button className="btn btn-secondary" id="Signinbtn">Sign in</button>
                        </div>
                    </div>
                    <div className="hero-image">
                        <img src={walletGif} alt="E-Wallet Illustration" />
                    </div>
                </section>
            </main>
            <Footer />
        </>
    );
}
import logo from "../assets/images/logo_placeholder.png";

function Branding(){
    return(
        <div className="branding">
            <img src={logo} alt="logo" />
            <h1>Shape</h1>
        </div>
    );
}

export default function Header(){
    return(
        <header>
            <Branding />
        </header>
    );
}


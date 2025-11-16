import "./AppHeader.css";
import logo from "./imgs/shopping-store.png";
import user from "./imgs/user.png";

function AppHeader() {

  return (
    <div className="App-header">
        <img src={logo} alt="Shopping Store Logo" style={{ height: '40px', marginLeft: "5px" }} />
        <h1>Shopper</h1>
        <img 
          src={user} alt="User Icon" 
          style={{ height: '40px', marginRight: "5px", marginLeft: "auto" }} 
        />
    </div>
  );
}

export default AppHeader;
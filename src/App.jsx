import './App.css';
import Playmat from "./playmatsCustom.jsx";
import Shirt from "./ShirtCustom.jsx";

function App() {
  const PlaymatOn = false;
  const ShirtOn = true;

  return (
    <div className="main-background">
      {PlaymatOn ? <Playmat /> : null}
      {ShirtOn ? <Shirt /> : null}
    </div>
  );
}

export default App;
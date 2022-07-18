import Header from "./Components/Header";
import Hero from "./Components/Hero";
import { Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="App ">
      <Header />
      <Routes>
        <Route path="/" element={<Hero />} />
      </Routes>
    </div>
  );
}

export default App;

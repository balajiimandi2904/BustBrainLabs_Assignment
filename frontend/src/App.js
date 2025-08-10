import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import FormBuilder from "./pages/FormBuilder";
import FormPreview from "./pages/FormPreview";
import FormResponse from "./pages/FormResponse";
import Home from "./pages/Home";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/builder/:id?" element={<FormBuilder />} />
        <Route path="/preview/:id" element={<FormPreview />} />
        <Route path="/response/:id" element={<FormResponse />} />
      </Routes>
    </Router>
  );
}

export default App;

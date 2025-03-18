import LinkedInPage from "./pages/LinkedInPage";
import MapPage from "./pages/MapPage";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import ReviewPage from "./pages/ReviewPage";

function App() {

  return (
    <>
      <BrowserRouter>
      <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/linkedIn" element={<LinkedInPage/>} />
          <Route path="/review" element={<ReviewPage />} />
      </Routes>
      </BrowserRouter>
    </>
  );
};


export default App

import LinkedInPage from "./pages/LinkedInPage";
import MapPage from "./pages/MapPage";
import { Route, BrowserRouter, Routes } from "react-router-dom";
import ReviewPage from "./pages/ReviewPage";
import NotFoundPage from "./pages/NotFoundPage";
import GooglePage from "./pages/GooglePage";

function App() {

  return (
    <>
      <BrowserRouter>
      <Routes>
          <Route path="/" element={<MapPage />} />
          <Route path="/google-review-analysis" element={<GooglePage />} />
          <Route path="/linkedIn" element={<LinkedInPage/>} />
          <Route path="/review" element={<ReviewPage />} />
          <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </BrowserRouter>
    </>
  );
};


export default App

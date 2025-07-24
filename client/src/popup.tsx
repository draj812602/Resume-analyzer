import ReactDOM from "react-dom/client";
import { AuthLandingPage } from "./components/AuthLandingPage";

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<AuthLandingPage />);
}

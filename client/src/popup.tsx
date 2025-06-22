import React from "react";
import ReactDOM from "react-dom/client";

const Popup: React.FC = () => {
  return (
    <div className="popup-container">
      <h1>Hello from Resume Analyzer Popup</h1>
      <p>Extension is working with TypeScript!</p>
    </div>
  );
};

const rootElement = document.getElementById("root");
if (rootElement) {
  ReactDOM.createRoot(rootElement).render(<Popup />);
} else {
  console.error("Root element not found");
}

import { StreamTheme } from "@stream-io/video-react-sdk";
import "@stream-io/video-react-sdk/dist/css/styles.css";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import { BrowserRouter } from "react-router-dom";

const theme = {
  colors: {
    primary: "#ff4d4f", // Neon red for DJ vibe
    background: "#1a1a1a", // Dark background
    text: "#ffffff",
  },
  fontFamily: '"Roboto", sans-serif', // Modern font
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <StreamTheme style={theme}>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StreamTheme>
);

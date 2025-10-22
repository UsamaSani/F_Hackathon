import { createRoot } from "react-dom/client";
import { Provider } from 'react-redux';
import { store } from './lib/store';
import App from "./App.tsx";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <App />
  </Provider>
);

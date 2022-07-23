import React from "react";
import ReactDOM from "react-dom";
import { MantineProvider } from "@mantine/core";
import { NotificationsProvider } from '@mantine/notifications';
import { Provider } from "react-redux";
import { store } from "./app/store";
import App from "./App";
import "./index.css";

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <MantineProvider>
        <NotificationsProvider autoClose={4000} position="top-right" zIndex={2077}>
        <App />
        </NotificationsProvider>
      </MantineProvider>
    </Provider>
  </React.StrictMode>,
  document.getElementById("root")
);

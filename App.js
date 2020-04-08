import React from "react";
import { registerRootComponent } from "expo";
import Routes from "./src/routes";

function App() {
  return <Routes />;
}

export default registerRootComponent(App);

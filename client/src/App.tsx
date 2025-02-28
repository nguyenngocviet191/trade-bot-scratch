import React from "react";
import { Switch, Route } from "wouter";
import Sidebar from "./components/Sidebar";
import Home from "./pages/Home";
import Market from "./pages/Market";
import Backtest from "./pages/Backtest";
import Report from "./pages/Report";
import Setting from "./pages/Setting";
import "./index.css";
 
const App: React.FC = () => {
  return (
    <div className="App flex">
      <Sidebar />
      <div className="flex-1 p-4">
        <Switch>
          <Route path="/">{() => <Home />}</Route>
          <Route path="/market">{() => <Market />}</Route>
          <Route path="/backtest">{() => <Backtest />}</Route>
          <Route path="/report">{() => <Report />}</Route>
          <Route path="/setting">{() => <Setting />}</Route>
        </Switch>
      </div>
      <h2 className="flex-1 p-4">
        Hello world!
      </h2>
  
    </div>

  );
};

export default App;

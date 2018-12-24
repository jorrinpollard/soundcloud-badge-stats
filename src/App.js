/*global browser*/

import React, { Component } from "react";
import "./App.css";
import Header from "./components/header";
import Toggler from "./components/toggler";

class App extends Component {
  state = { status: "Pending" };

  componentDidMount() {
    browser.storage.local.get("status").then((onGot, onError) => {
      const currentStatus = onGot["status"] || "Enabled";
      this.setState({ status: currentStatus });
    });
  }

  handleToggle = status => {
    const newStatus = this.state.status == "Enabled" ? "Disabled" : "Enabled";
    this.setState({ status: newStatus });
    browser.storage.local.set({ status: newStatus });
  };

  render() {
    return (
      <div className="App">
        <Header />
        <Toggler status={this.state.status} onToggle={this.handleToggle} />
      </div>
    );
  }
}

export default App;

import React, { Component } from "react";

class Header extends Component {
  render() {
    return (
      <header className="w-75 m-auto">
        <img src="logo.png" className="w-25 m-auto" />
        <h5 className="text-center">soundcloud-badge-stats</h5>
      </header>
    );
  }
}

export default Header;

import React, { Component } from "react";

class Toggler extends Component {
  render() {
    return (
      <div className="btn-group btn-group-toggle my-3" data-toggle="buttons">
        <button
          className={this.getButtonClasses()}
          onClick={() => this.props.onToggle(this.props.status)}
        >
          {this.props.status}
        </button>
      </div>
    );
  }

  getButtonClasses() {
    if (this.props.status === "Pending") return "d-none";
    let classes = "btn btn-";
    classes += this.props.status === "Enabled" ? "success" : "danger";
    return classes;
  }
}

export default Toggler;

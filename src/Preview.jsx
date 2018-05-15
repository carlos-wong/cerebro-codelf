import React, { Component } from "react";
import PropTypes from "prop-types";

var log = require("loglevel");


export default class Preview extends Component {
  render() {
    const { lines } = this.props;
    log.debug('dump in preview lines is:',lines);
    return (
      <div>
        <h2>{"hicarlos"}</h2>
      </div>
    );
  }
}

Preview.propTypes = {
  lines: PropTypes.array,
};

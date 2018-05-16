import React, { Component } from "react";
import PropTypes from "prop-types";
import SyntaxHighlighter from 'react-syntax-highlighter';
import { docco } from 'react-syntax-highlighter/styles/hljs';
var log = require("loglevel");

export default class Preview extends Component {
  render() {
    const { lines } = this.props;
    log.debug('dump in preview lines is:',lines);
    return (
      <div>
        <h2>{"hicarlos"}</h2>
        <SyntaxHighlighter language='javascript' style={docco}>{'1: (num) => num + 1'}</SyntaxHighlighter>
      </div>
    );
  }
}

Preview.propTypes = {
  lines: PropTypes.array,
};

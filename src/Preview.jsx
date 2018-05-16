import React, { Component } from "react";
import PropTypes from "prop-types";
// import SyntaxHighlighter from "react-syntax-highlighter";
import SyntaxHighlighter from "react-syntax-highlighter";
import virtualizedRenderer from "react-syntax-highlighter-virtualized-renderer";

import { docco } from "react-syntax-highlighter/styles/hljs";
import { atomDark } from "react-syntax-highlighter/styles/prism";

var log = require("loglevel");
const _ = require("lodash");
import axios from "axios";
var searchcode_result_axios = axios.create({
  baseURL: "https://searchcode.com/api/result/",
  timeout: 10000
});

export default class Preview extends Component {
  draw_code() {
    const { lines, language } = this.props;
    language = _.lowerCase(language);
    let ret = _.map(lines, (value, key) => {
      return (
        <SyntaxHighlighter key={key} language={language} style={docco}>
          {key + ": " + value}
        </SyntaxHighlighter>
      );
    });
    log.debug("dump ret is:", ret);
    return <div style={{ width: "100%" }}>{ret}</div>;
  }

  constructor(props) {
    super(props);
    this.state = {
      code: "Loading"
    };
  }
  render() {
    const { lines, language, id } = this.props;
    var codeString = "\n";
    let newlanguage = _.lowerCase(language);
    if (newlanguage === "c") {
      newlanguage = "cpp";
    }
    log.debug("language is:", language);
    const tmpCodeString = "(num) => num + 1";
    // searchcode_result_axios
    searchcode_result_axios.get(id + "/").then(response => {
      log.debug("response is:", response.data.code);
      this.setState({
        code: response.data.code
      });
    });
    return (
      <div style={{ width: "100%" }}>
        <h2>{"hicarlos"}</h2>
        <div
          style={{
            width: "100%",
            flex: 1
          }}
        >
          <SyntaxHighlighter language={"javascript"} style={docco}>
            {this.state.code}
          </SyntaxHighlighter>
        </div>
      </div>
    );
  }
}

Preview.propTypes = {
  lines: PropTypes.array,
  language: PropTypes.string,
  id: PropTypes.number
};

import React, { Component } from "react";
import PropTypes from "prop-types";
// import SyntaxHighlighter from "react-syntax-highlighter";
import SyntaxHighlighter from "react-syntax-highlighter";
const md5 = require("md5");
var Scroll = require("react-scroll");
var Link = Scroll.Link;
var DirectLink = Scroll.DirectLink;
var Element = Scroll.Element;
var Events = Scroll.Events;
var scroll = Scroll.animateScroll;
var scrollSpy = Scroll.scrollSpy;

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
      code: "Loading",
      fetched: false,
      lastId: 0,
      Loading: true
    };
  }
  render() {
    const { lines, language, id, url, actions } = this.props;
    log.debug("actions is:", actions);
    var codeString = "\n";
    let targetLanguage = _.lowerCase(language);
    if (targetLanguage === "c") {
      targetLanguage = "cpp";
    }
    log.debug("language is:", targetLanguage, " id is:", id);
    const tmpCodeString = "(num) => num + 1";
    // searchcode_result_axios
    log.debug("get preview state is:", this.state);
    if (id !== this.state.lastId) {
      this.setState({
        code: "Loading",
        lastId: id
      });
      searchcode_result_axios.get(id + "/").then(response => {
        log.debug("response data md5 is:", md5(response.data.code));
        this.setState({
          code: response.data.code,
          fetched: true,
          lastId: id
        });
      });
    }
    log.debug("debug actions open is:", actions.open);
    return (
      <Element style={{ width: "100%", height: "100%" }}>
        <div style={{ width: "100%" }}>
          <div style={{ height: "6px" }} />
          <a
            herf={url}
            onClick={() => {
              log.debug("click url:" + url);
              actions.open(url);
            }}
          >
            {url}
          </a>
          <div
            style={{
              width: "100%",
              flex: 1
            }}
          >
            <SyntaxHighlighter language={targetLanguage} style={docco}>
              {this.state.code}
            </SyntaxHighlighter>
          </div>
          <div style={{ height: "10px" }} />
        </div>
      </Element>
    );
  }
}

Preview.propTypes = {
  lines: PropTypes.array,
  language: PropTypes.string,
  id: PropTypes.number,
  url: PropTypes.string,
  actions: PropTypes.object
};

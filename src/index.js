var isChinese = require("is-chinese");
const { clipboard, nativeImage } = require("electron");
import axios from "axios";
var lodash = require("lodash");
const _ = lodash;
var log = require("loglevel");
const qs = require("querystring");
const md5 = require("md5");
const youdao_zh_2_en = "zh-CHS2EN";
process.env.NODE_ENV = "production";

let isDev = require("isdev");
const Preview = require("./Preview.jsx").default;

console.log("isDev:", isDev);

if (isDev) {
  log.setLevel("debug");
  log.debug("in Development");
} else {
  log.setLevel("silent");
  console.log("Not in Development!");
}

var getKeyWordReg = function(key) {
  return new RegExp(
    "([\\-_\\w\\d\\/\\$]{0,}){0,1}" + key + "([\\-_\\w\\d\\$]{0,}){0,1}",
    "gi"
  );
};

var showing_display = [];

const youdaoapi_url = "http://openapi.youdao.com/api";

var youdao_axios = axios.create({
  baseURL:
    "http://fanyi.youdao.com/openapi.do?callback=?&keyfrom=Codelf&key=2023743559&type=data&doctype=json&version=1.1",
  timeout: 10000
});

var searchcode_axios = axios.create({
  baseURL: "https://searchcode.com/api/codesearch_I/",
  timeout: 10000
});

async function query_youdao(q, display) {
  var key = "LZFy0Ys97fCnWnb6f439ZD4hj37lOz8c";
  var salt = "ge9wo1si";
  let appKey = "0998295557105306";
  var str1 = appKey + q + salt + key;
  var sign = md5(str1);

  const query = qs.stringify({
    q: q,
    appKey: appKey,
    salt: salt,
    sign: sign,
    type: "data",
    doctype: "json",
    version: "1.1"
  });
  try {
    let r = await fetch(`${youdaoapi_url}?${query}`);

    let translated = await r.json();

    if (translated.l === youdao_zh_2_en) {
      let explains = translated.basic.explains;
      let webExplains = translated.web;

      let ret = show_basic_explain(explains, display);
      ret = _.uniq(_.concat(ret, show_web_explain(webExplains, display)));
      log.debug("query ret is:", ret);
      return ret;
    }
  } catch (err) {
  } finally {
    return [];
  }
}
function show_basic_explain(explains, display) {
  if (explains && explains.length > 0) {
    let ret = [];
    explains.forEach((data, index) => {
      const match = data.match(/^\[.*\] (.+)$/);
      let data_remove_identification = match ? match[1].trim() : null;
      if (data_remove_identification == null) {
        data_remove_identification = data;
      }
      let data_after_separate = data_remove_identification.split(/[；；。.]/);
      if (data_after_separate && data_after_separate.length > 0) {
        data_after_separate.forEach((value, index) => {
          if (value && value.length > 0) {
            ret[ret.length] = value;
          }
        });
      }
    });
    return ret;
  } else {
    return [];
  }
}

function show_web_explain(webExplains, display) {
  let ret = [];
  if (webExplains && webExplains.length > 0) {
    let firstValue = webExplains[0].value;
    firstValue.forEach((data, index) => {
      ret[ret.length] = data;
    });
  }
  return ret;
}

var async_handle_event = async function(
  search_content,
  display,
  hide,
  actions
) {
  log.debug("start to fetch data");
  let translated = await query_youdao(search_content);
  if (translated.length <= 0) {
    translated[0] = search_content;
  }
  log.debug("translated is:", translated);
  if (!search_content || search_content.length <= 0) {
    log.debug("hide fetch item");
    hide("codelffetch");
    return;
  }
  let els = { lastVal: "", valHistory: "", valRegs: [] };
  let response = {};
  // if (isChinese(search_content)) {
  //   response = await youdao_axios.get("", { params: { q: search_content } });
  // } else {
  //   response.data = {
  //     web: [{ value: [search_content] }],
  //     translation: [search_content]
  //   };
  // }
  // var searchcode =
  //   (response.data &&
  //     response.data.web &&
  //     response.data.web[0] &&
  //     response.data.web[0].value &&
  //     response.data.web[0].value[0]) ||
  //   (response.data.translation && response.data.translation[0]) ||
  //   "";
  var tdata = response.data;
  // if (tdata.basic && tdata.basic.explains) {
  //   els.valHistory = tdata.basic.explains.join(" ");
  // }
  // els.valHistory = translated[0].join(" ");
  // //web translate
  // if (tdata.web && tdata.web) {
  //   tdata.web.forEach(function(key) {
  //     els.valHistory += " " + key.value.join(" ");
  //   });
  // }
  translated.forEach((value, index) => {
    log.debug("create els value from translated is:", value);
    els.valHistory +=
      " " +
      value
        // .join(" ")
        .replace(/[!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/g, "")
        .split(" ")
        .filter(function(key, idx, inputArray) {
          return inputArray.indexOf(key) == idx && !/^(a|an|the)$/gi.test(key);
        });
  });
  log.debug("els valHistory is:", els.valHistory);
  // if (tdata && tdata.translation) {
  //   els.lastVal =
  //     els.lastVal +
  //     " " +
  //     tdata.translation
  //       .join(" ")
  //       .replace(/[!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/g, "")
  //       .split(" ")
  //       .filter(function(key, idx, inputArray) {
  //         return inputArray.indexOf(key) == idx && !/^(a|an|the)$/gi.test(key);
  //       })
  //       .join(" ");
  // } else {
  // }
  els.lastVal = translated[0].trim();
  els.lastVal = els.lastVal
    .split(" ")
    .filter(function(key, idx, inputArray) {
      return inputArray.indexOf(key) == idx;
    })
    .join(" ");
  els.valRegs = [];
  els.lastVal
    .replace(/\s+/gi, "+")
    .split("+")
    .forEach(function(key) {
      key.length && key.length > 1 && els.valRegs.push(getKeyWordReg(key));
    });
  translated.forEach((key, index) => {
    key.length && key.length > 1 && els.valRegs.push(getKeyWordReg(key));
  });
  // els.valRegs.push(
  //   getKeyWordReg(searchcode.replace(/\ /gi, "*").toLowerCase())
  // );

  let results = [];
  let search_end = [];
  translated.forEach(async (value, index, list) => {
    log.debug("search code value:", value, " list:", list);
    response = await searchcode_axios.get("/", {
      params: {
        q: value,
        p: 0,
        per_page: 90
      }
    });
    results = _.concat(results, response.data.results);
    search_end = _.concat(search_end, [value]);
    if (search_end.length >= list.length) {
      log.debug("search end");
      let lineStr = [];
      var vals = [],
        labels = [];

      let found_keyword = {};
      let resultByKeyword = {};
      log.debug("result count is:", results.length);
      log.debug("value regs is:", els.valRegs);
      log.debug("search code results is:", results);
      let debug_result = results[0].lines;
      results.forEach(function(rkey) {
        //filter codes
        lineStr = [];
        for (var lkey in rkey.lines) {
          var lstr = rkey.lines[lkey];
          //no base64
          if (!(/;base64,/g.test(lstr) && lstr.length > 256)) {
            lstr
              .split(
                /[\-|\/|\ |\(|\)|\>|\,|\[|\]|\*|\&]|\=|\"|\:|\.|\'|\$|\{|\}|\<|\\n|\#|\;|\\|\~|\`/
              )
              .forEach(value => {
                if (value.length && value.length > 0) {
                  els.valRegs.forEach(function(key) {
                    if (value.match(key)) {
                      let newvalue = value.trim();
                      log.debug(
                        "debug cal the frequency of match word:",
                        found_keyword[newvalue],
                        " new value:",
                        newvalue
                      );
                      if (!resultByKeyword[newvalue]) {
                        resultByKeyword[newvalue] = [];
                      }
                      resultByKeyword[newvalue].push(rkey);
                      resultByKeyword[newvalue] = _.uniq(
                        resultByKeyword[newvalue]
                      );
                      log.debug("resutl by keyword is:", resultByKeyword);
                      if (found_keyword[newvalue]) {
                        found_keyword[newvalue] += 1;
                      } else {
                        found_keyword[newvalue] = 1;
                      }
                    }
                  });
                }
              });
          }
        }
      });
      var keyword_array_map = lodash.map(found_keyword, (value, key) => {
        return { found_word: { count: value, name: key } };
      });
      var keyword_after_sort = lodash.sortBy(keyword_array_map, [
        o => {
          return 0 - o.found_word.count;
        }
      ]);
      log.debug("keyword after sort is:", keyword_after_sort);
      var try_remove_fetching_item = true;
      lodash.map(lodash.slice(keyword_after_sort, 0, 20), (value, key) => {
        let value_name = value.found_word.name;
        if (try_remove_fetching_item) {
          try_remove_fetching_item = false;
          hide("codelffetch");
        }

        let lines = { lines: debug_result };
        let display_id = "id-" + value_name;
        showing_display.push(display_id);
        display({
          id: display_id,
          title: " [" + value.found_word.count + "] " + value_name,
          onSelect: event => {
            log.debug("on select event is:", event);
            clipboard.writeText(value_name);
          },

          onKeyDown: event => {
            let innerEvent = _.clone(event);
            log.debug("innerEvent is:", innerEvent);
            if (innerEvent.keyCode === 9) {
              event.preventDefault();
              log.debug("tab is down");
              log.debug("showing display push is:", showing_display);
              showing_display.forEach((value, index) => {
                hide(value);
              });
              let keyword_projects = resultByKeyword[value_name];
              showing_display = [];
              log.debug("keyword projects is:", keyword_projects);
              keyword_projects.forEach(value => {
                let title = "project-" + value.repo;
                showing_display.push(title);
                let lines = { lines: value };
                let searchcode = value;
                log.debug("value lines is:", lines);
                searchcode.actions = actions;

                display({
                  id: title,
                  title: value.repo
                    .replace("https://", "")
                    .replace("http://", ""),
                  getPreview: () => <Preview {...searchcode} />,
                  onSelect: event => {
                    log.debug("value is:", value);
                    clipboard.writeText(value_name);
                    actions.open(value.url);
                  }
                });
              });
            }
            // let innerEvent = _.cloneDeep(event);
            // log.debug("debug key event code is:", innerEvent);
            // event.preventDefault();
          }
        });
      });
    }
  });

  return;
};

var handle_event = _.debounce(
  (search_content, display, hide, actions) => {
    async_handle_event(search_content, display, hide, actions);
  },
  1600,
  { trailing: true }
);

export const fn = ({ term, display, hide, actions }) => {
  // Put your plugin code here
  var split_contents = term.split(" ");
  if (split_contents[0] == "codelf") {
    var search_contents = lodash.slice(split_contents, 1);
    if (search_contents[0] && search_contents[0].length > 0) {
      // log.debug("debug search content is:", search_contents[0]);
      display({
        title: "codelf fetch...",
        id: "codelffetch"
      });
      showing_display = [];
      handle_event(search_contents.join(" "), display, hide, actions);
    }
  }
};

export const name = "codelf";
export const keyword = "codelf";

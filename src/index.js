const Preview = require('./preview');
var isChinese = require('is-chinese');
const { clipboard, nativeImage } = require('electron');
import axios from 'axios';
var lodash = require('lodash');
var log = require('loglevel');
log.setLevel('debug');

var getKeyWordReg = function (key) {
    return new RegExp('([\\-_\\w\\d\\/\\$]{0,}){0,1}' + key + '([\\-_\\w\\d\\$]{0,}){0,1}', 'gi');
};

var youdao_axios = axios.create({
    baseURL: 'http://fanyi.youdao.com/openapi.do?callback=?&keyfrom=Codelf&key=2023743559&type=data&doctype=json&version=1.1',
    timeout: 10000,
});

var searchcode_axios = axios.create({
    baseURL: 'https://searchcode.com/api/codesearch_I/',
    timeout: 10000,
});

var async_handle_event = async function (search_content,display){
    
    if (!search_content || search_content.length <=0) {
        return;
    }
    let els = {lastVal:"",valHistory:"",valRegs:[]};
    let response ={};
    if( isChinese(search_content)){
        response = await youdao_axios.get('',{params: {q: search_content }});
    }
    else{
        response.data = {web:[{value:[search_content]}],translation:[search_content]};
    }
    var searchcode = ((response.data && response.data.web && response.data.web[0]) && response.data.web[0].value && response.data.web[0].value[0]) || (response.data.translation && response.data.translation[0] ) || "";
    var tdata = response.data;
    if (tdata.basic && tdata.basic.explains) {
        els.valHistory = tdata.basic.explains.join(' ');
    }
    //web translate
    if (tdata.web && tdata.web) {
        tdata.web.forEach(function (key) {
            els.valHistory += ' ' + key.value.join(' ');
        });
    }
    if (tdata && tdata.translation) {
        els.lastVal = els.lastVal + ' '
            + tdata.translation.join(' ')
            .replace(/[!$%^&*()_+|~=`{}\[\]:";'<>?,.\/]/g, '')
            .split(' ').filter(function (key, idx, inputArray) {
                return inputArray.indexOf(key) == idx && !/^(a|an|the)$/ig.test(key);
            }).join(' ');
    } else {
    }
    els.lastVal = els.lastVal.trim();
    els.lastVal = els.lastVal.split(' ').filter(function (key, idx, inputArray) {
        return inputArray.indexOf(key) == idx;
    }).join(' ');
    els.valRegs = [];
    els.lastVal.replace(/\s+/ig, '+').split('+').forEach(function (key) {
        key.length && key.length > 1 && els.valRegs.push(getKeyWordReg(key));
    });
    els.valRegs.push(getKeyWordReg(searchcode.replace(/\ /ig, '*').toLowerCase()));
    response = await searchcode_axios.get('/',{
        params:{
            q:searchcode,
            p:0,
            per_page:90,
        }
    });

    let data = response.data;
    let lineStr = [];

    var vals = [], labels = [];

    let found_keyword = {};

    data.results.forEach(function (rkey) {
        //filter codes
        lineStr = [];
        for (var lkey in rkey.lines) {
            var lstr = rkey.lines[lkey];
            //no base64
            if (!(/;base64,/g.test(lstr) && lstr.length > 256)) {
                lstr.split(/[\-|\/|\ |\(|\)|\>|\,|\[|\]|\*|\&]|\=|\"|\:|\.|\'|\$|\{|\}|\<|\\n|\#|\;|\\|\~|\`/).forEach((value)=>{
                    if (value.length && value.length > 0) {
                        els.valRegs.forEach(function (key) {
                            if (value.match(key)) {
                                let newvalue = value.trim();
                                if(found_keyword[newvalue]){
                                    found_keyword[newvalue] += 1;
                                }
                                else{
                                    found_keyword[newvalue] = 1;
                                }
                            }
                        });
                    }
                });
            }
        }
    });
    var keyword_array_map = lodash.map(found_keyword,(value,key)=>{
        return {found_word:{count:value,name:key}};
    });
    var keyword_after_sort = lodash.sortBy(keyword_array_map,[(o)=>{
        return o.count;}]);
    lodash.map(keyword_after_sort,(value,key)=>{
        let value_name = value.found_word.name;
        display({
            title: value_name,
            onSelect:()=>{
                clipboard.writeText(value_name);
            }
        });
    });
    return;
}

var handle_event = lodash.throttle((search_content,display)=>{async_handle_event(search_content,display);},3000);

export const fn = ({ term, display }) => {
    // Put your plugin code here
    var split_contents = term.split(" ");
    if(split_contents[0] == 'codelf'){
        var search_contents = lodash.slice(split_contents,1);
        handle_event(search_contents.join(" "),display);
        log.debug('handle codelf event carlos');
    }
};

export const name = 'codelf';
export const keyword = 'codelf';

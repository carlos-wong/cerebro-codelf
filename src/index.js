const Preview = require('./preview');
import axios from 'axios';
var lodash = require('lodash');

var youdao_axios = axios.create({
    baseURL: 'http://fanyi.youdao.com/openapi.do?callback=?&keyfrom=Codelf&key=2023743559&type=data&doctype=json&version=1.1',
    timeout: 10000,
});

var searchcode_axios = axios.create({
    baseURL: 'https://searchcode.com/api/codesearch_I/',
    timeout: 10000,
});

var handle_event = lodash.throttle((search_content,display)=>{
    if (!search_content || search_content.length <=0) {
        return;
    }
    youdao_axios.get('',{params: {q: search_content }})
        .then(function (response) {
            var youdao_ret = response.data;
            console.log('type is:',typeof youdao_ret);
            var searchcode = youdao_ret.web[0].value[0];
            console.log('youdao ret is:',searchcode);
            return searchcode_axios.get('/',{
                params:{
                    q:searchcode,
                    p:0,
                    per_page:16,
                }
            });
        })
        .then((response)=>{
            console.log('response is:',response.data.results);
        }) 
        .catch(function (error) {
            console.log(error);
        });
},3000);

export const fn = ({ term, display }) => {
    // Put your plugin code here
    var split_contents = term.split(" ");
    if(split_contents[0] == 'codelf'){
        // console.log('split contents is:', split_contents);
        var search_contents = lodash.slice(split_contents,1);
        // console.log('search contents:',search_contents.join(" "));
        handle_event(search_contents.join(" "),display);
        // searchcode_axios.get('/?q=array',{
        //     params:{
        //         q:'array',
        //         p:0,
        //         per_page:16,
        //     }
        // })
        // .then((response)=>{
        //     console.log(response);
        //     display({
        //         title: "hicarlos",
        //         getPreview: () => {return response.data;}
        //     });
        // })
        // .catch((response)=>{
        //     console.log(response);
        // }) ;
    }
    

    
};

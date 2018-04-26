const Preview = require('./preview');
import axios from 'axios';
var lodash = require('lodash');

var instance = axios.create({
    baseURL: 'http://fanyi.youdao.com/openapi.do?callback=?&keyfrom=Codelf&key=2023743559&type=data&doctype=jsonp&version=1.1',
    timeout: 10000,
    headers: {'X-Custom-Header': 'foobar'}
});

export const fn = ({ term, display }) => {
    // Put your plugin code here
    var split_contents = term.split(" ");
    if(split_contents[0] == 'codelf'){
        // console.log('split contents is:', split_contents);
        var search_contents = lodash.slice(split_contents,1);
        console.log('search contents:',search_contents.join(" "));
        display({
            title: "hicarlos",
            getPreview: () => <Preview data={{a:1}}  />
        },
               );
    }
    // instance.get('',{params: {q: '你好' }})
    //     .then(function (response) {
    //         console.log(response);
    //     })
    //     .catch(function (error) {
    //         console.log(error);
    //     });

    
};

const Preview = require('./preview');
import axios from 'axios';

var instance = axios.create({
    baseURL: 'http://fanyi.youdao.com/openapi.do?callback=?&keyfrom=Codelf&key=2023743559&type=data&doctype=jsonp&version=1.1',
    timeout: 10000,
    headers: {'X-Custom-Header': 'foobar'}
});

export const fn = ({ term, display }) => {
    // Put your plugin code here
    instance.get('',{params: {q: '你好' }})
        .then(function (response) {
            console.log(response);
        })
        .catch(function (error) {
            console.log(error);
        });

    display({
        title: "hicarlos",
        getPreview: () => <Preview data={{a:1}}  />
        },
    );
};

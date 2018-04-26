const Preview = require('./preview');

export const fn = ({ term, display }) => {
    // Put your plugin code here
    display({
        title: "hicarlos",
        getPreview: () => <Preview data={{a:1}}  />
        },
    );
};

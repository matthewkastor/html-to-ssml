
var jsdom = require("jsdom").jsdom;
var html = '<div id="test"></div>';
var document = jsdom(html, null, {
    features: {
        FetchExternalResources : false,
        ProcessExternalResources : false
    }
});
var window = document.createWindow();
require('./classListShim')(window);

var d = document.getElementById('test');
console.log(d.classList); // none
d.classList.toggle('one');
console.log(d.classList); // one
d.classList.toggle('one');
console.log(d.classList); // none
d.classList.add('two');
console.log(d.classList); // two
d.classList.remove('two');
console.log(d.classList); // none

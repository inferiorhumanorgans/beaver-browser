var app = 'com.inferiorhumanorgans.beaverpass';
var m = require('mithril');

var activeDomain;
var activeTab;
var root;

// http://stackoverflow.com/questions/23618744/rendering-comma-separated-list-of-links
/* intersperse: Return an array with the separator interspersed between
 * each element of the input array.
 *
 * > _([1,2,3]).intersperse(0)
 * [1,0,2,0,3]
 */
function intersperse(arr, sep) {
  if (arr.length === 0) {
      return [];
  }

  return arr.slice(1).reduce(function(xs, x, i) {
      return xs.concat([sep, x]);
  }, [arr[0]]);
}

// https://stackoverflow.com/questions/951021/what-is-the-javascript-version-of-sleep
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function searchEntryComparator(a, b) {
  var c = a.title.toLowerCase();
  var d = b.title.toLowerCase();

  if (c < d) {
    return -1;
  }
  if (c > d) {
    return 1;
  }

  return 0;
}

class SearchComponent {
    constructor(vnode) {}

    static entryClick(e) {
      var searchEntry = JSON.parse(e.target.parentElement.getAttribute("data-entry"));
        doFetch(searchEntry.path);
    }

    static myChange(a) {
      if (SearchComponent.searchOn == false) {
        var term = a.target.value;
        if (term === "") {
          doSearch(activeDomain);
        } else {
          doSearch(a.target.value);
        }
      }
    }

    view() {
      var results = SearchComponent.results
        .map(function(entry) {
          var breadcrumbs = entry.split('/');
          return {
            title: breadcrumbs[1] || breadcrumbs[0],
            domain: breadcrumbs[0],
            path: entry,
            // favicon: "TODO"
          };
        })
        .sort(searchEntryComparator);

      var listEntries = results.map(function(entry) {
        return m("li",
          {onclick: SearchComponent.entryClick, "data-entry": JSON.stringify(entry)},
          [
            // m("div",  m("img", {src: entry.favicon})),
            m("div", entry.title),
            m("div", entry.domain)
          ]
        );
      })

      return m("div", [
        m("input.search", {type: "text", placeholder: "Search password...", autofocus: "autofocus", tabindex: 1, oninput: SearchComponent.myChange}),
        m("ul.search", listEntries)
      ]);
    }
}
SearchComponent.results = [];
SearchComponent.searchOn = false;

function doFetch(path) {
  chrome.runtime.sendNativeMessage(app, { "action": "get", "entry": path }, function(response) {
    if (typeof(response) === "undefined") {
      console.log("Error", chrome.runtime.lastError);
      return;
    }

    chrome.tabs.executeScript(
  		{code: `var login = ${JSON.stringify(response)}; var fetchEntry = true;`},
  		function() {
        console.log("Calling execute script");
        chrome.tabs.executeScript({ file: '/inject.bundle.js', allFrames: true });
        window.close();
      }
  	);


    console.log(response);
    m.redraw();
    document.querySelector('input.search').focus();
  });
}

function doSearch(searchQuery) {
  SearchComponent.searchOn = true;
  chrome.runtime.sendNativeMessage(app, { "action": "search", "domain": searchQuery }, function(response) {
    if (typeof(response) === "undefined") {
      console.log("Error", chrome.runtime.lastError);
      return;
    }

    console.log(response.data);
    SearchComponent.results = response.data;
    m.redraw();
    document.querySelector('input.search').focus();
    SearchComponent.searchOn = false;
  });
}

function callbackHell() {
  var parser = document.createElement('a');
  parser.href = activeTab.url;
  activeDomain = parser.hostname;

  m.mount(root, SearchComponent);
  doSearch(activeDomain);
}

function init() {
  root = document.getElementById('mount');

  if (root == null) {
    return;
  }

  chrome.tabs.query({ currentWindow: true, active: true }, function (tabs) {
    activeTab = tabs[0];
    callbackHell();
  });
}

// To work around: https://bugs.chromium.org/p/chromium/issues/detail?id=428044
setTimeout(function(){
  init();
}, 15);

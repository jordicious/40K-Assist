chrome.app.runtime.onLaunched.addListener(function() {
    chrome.app.window.create("index.html",
        {  frame: "none",
            id: "framelessWinID",
            innerBounds: {
                width: screen.availHeight,
                height: screen.availHeight,
               }
        }
    );
});
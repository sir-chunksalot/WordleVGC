
// function handleMessages(message, sender, sendResponse) {
//   if (message !== 'get-wordle-answer') return;

//   //const ans = getWordleAnswer();
//   sendResponse({statusCode: "fart"});

//   // Since `fetch` is asynchronous, must retu rn an explicit `true`
//   return true;
// }


// function getWordleAnswer() {
//   chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
//   const activeTab = tabs[0];
//   if (!activeTab) return;

//   try {
//     // Execute code on the active page and capture the result array
//     const results = await chrome.scripting.executeScript({
//       target: { tabId: activeTab.id },
//       func: () => {
//         // This line runs directly in the browser tab context
//         return (new window.wordle.bundle.GameApp).solution;
//       }
//     });

//     // The result is wrapped in an injection object array
//     const pageTitle = results[0].result;
//     console.log("Returned result from page:", pageTitle);

//   } catch (error) {
//     console.error("Failed to execute script:", error);
//   }
// });

// }

// chrome.runtime.onMessage.addListener(handleMessages);


// $(document).ready(function(){
//     alert("working");
// });


// chrome.runtime.onMessage.addListener(function (request, sender, sendResponse) {
//   console.log(request, sender, sendResponse);
// });
console.log("BACKGROUND LOADED");

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("BACKGROUND RECEIVED", Date.now());

    sendResponse({ success: true, ans: (new window.wordle.bundle.GameApp).solution });
});
const backgroundDebugging = 0;

// Intercepts calls to SoundCloud's /followings and /followers API endpoint and persists them in browser.storage.local
backgroundMain = details => {
  if (backgroundDebugging) console.log(details);

  // Requires Firefox 57.0 or higher, not implemented in Chrome
  const filter = browser.webRequest.filterResponseData(details.requestId);

  // read chunked response data from webRequest.StreamFilter.ondata
  let data = "";
  const decoder = new TextDecoder("utf-8");
  filter.ondata = event => {
    data += decoder.decode(event.data, { stream: true });
  };

  // persist data with the user's permalink as the object's key
  filter.onstop = event => {
    const followingsData = JSON.parse(data);
    const collectionResponse = followingsData["collection"];

    if (backgroundDebugging) console.log(collectionResponse);

    for (let i = 0; i < collectionResponse.length; i++) {
      const userStorageObject = {};
      const permalink = collectionResponse[i]["permalink"];
      userStorageObject[permalink] = collectionResponse[i];
      browser.storage.local.set(userStorageObject);
    }

    // write unmodified data to client
    const encoder = new TextEncoder();
    filter.write(encoder.encode(data));
    filter.close();
  };

  return {};
};

browser.webRequest.onBeforeRequest.addListener(
  backgroundMain,
  {
    urls: [
      "*://api-v2.soundcloud.com/users/*/followings*",
      "*://api-v2.soundcloud.com/users/*/followers*"
    ]
  },
  ["blocking"]
);

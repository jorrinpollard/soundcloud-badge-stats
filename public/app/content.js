const contentDebugging = 0;

// Capitalize a string
capitalize = string => {
  return string.charAt(0).toUpperCase() + string.slice(1);
};

// Add commas to integers over 1000
numberWithCommas = string => {
  let value = parseInt(string, 10);

  if (value >= 1000)
    value = value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

  return value;
};

// Shorten integers over 1000
numberWithSuffix = string => {
  let value = parseInt(string, 10);
  let suffixes = ["", "K", "M"];
  let suffixNum = Math.floor(("" + value).length / 3);
  let shortValue = "";

  if (value >= 1000) {
    for (let precision = 2; precision >= 1; precision--) {
      shortValue = parseFloat(
        (suffixNum != 0
          ? value / Math.pow(1000, suffixNum)
          : value
        ).toPrecision(precision)
      );

      if ((shortValue + "").replace(/[^a-zA-Z 0-9]+/g, "").length <= 2) break;
    }

    if (shortValue % 1 != 0) shortNum = shortValue.toFixed(1);
    value = shortValue + suffixes[suffixNum];
  }

  return value;
};

// Appends data to userBadgeListItem element using SoundCloud's existing markup
appendDataToBadge = (data, badge) => {
  if (contentDebugging) console.log("appendDataToBadge init");

  // create elements
  const badgeStats = document.createElement("div");
  const infoStats = document.createElement("article");
  const infoStatsTable = document.createElement("table");
  const tBody = document.createElement("tbody");
  const tRow = document.createElement("tr");

  // set element attributes
  badgeStats.setAttribute("class", "userBadgeListItem__stats");
  infoStats.setAttribute(
    "class",
    "soundcloud-badge-stats__infoStats infoStats"
  );
  infoStatsTable.setAttribute(
    "class",
    "soundcloud-badge-stats__table infoStats__table sc-type-small"
  );
  tBody.setAttribute("class", "soundcloud-badge-stats__tbody infoStats");

  // append elements
  badge.appendChild(badgeStats);
  badgeStats.appendChild(infoStats);
  infoStats.appendChild(infoStatsTable);
  infoStatsTable.appendChild(tBody);
  tBody.appendChild(tRow);

  const permalink = data["permalink"];
  const whitelist = {
    followers: "followers_count",
    tracks: "track_count"
  };

  for (const k in whitelist) {
    // create elements
    const stat = document.createElement("td");
    const statLink = document.createElement("a");
    const statTitle = document.createElement("h3");
    const statValue = document.createElement("div");

    // set element attributes
    const contentTitle = capitalize(k);
    const contentValue = numberWithSuffix(data[whitelist[k]]);
    const linkTitle = numberWithCommas(data[whitelist[k]]) + " " + contentTitle;

    let statClass = "soundcloud-badge-stats__stat infoStats__stat";
    if (!(k === "tracks")) statClass += " sc-border-light-right";

    stat.setAttribute("class", statClass);
    statLink.setAttribute("href", "/" + permalink + "/" + k);
    statLink.setAttribute("rel", "nofollow");
    statLink.setAttribute("class", "infoStats__statLink sc-link-light");
    statLink.setAttribute("title", linkTitle);
    statTitle.setAttribute("class", "infoStats__title sc-font-light");
    statTitle.innerText = contentTitle;
    statValue.setAttribute("class", "infoStats__value sc-font-tabular-light");
    statValue.innerText = contentValue;

    // append elements
    tRow.appendChild(stat);
    stat.appendChild(statLink);
    statLink.appendChild(statTitle);
    statLink.appendChild(statValue);

    if (contentDebugging) console.log("contentTitle: " + contentTitle);
    if (contentDebugging) console.log("contentValue: " + contentValue);
    if (contentDebugging) console.log("linkTitle: " + linkTitle);
    if (contentDebugging) console.log("statClass: " + statClass);
  }

  // Mark badge as imported so parseBadges() skips it
  badge.setAttribute("data-imported", "true");
};

// Iterates over userBadgeListItem elements and appends data
parseBadges = () => {
  if (contentDebugging) console.log("parseBadges init");

  const userBadges = document.querySelectorAll(".userBadgeListItem");
  if (contentDebugging) console.log(userBadges);

  for (let i = 0; i < userBadges.length; i++) {
    const userBadge = userBadges[i];

    // Skip already parsed badges
    if (userBadge.getAttribute("data-imported")) continue;

    const permalink = userBadge
      .querySelectorAll("a")[0]
      .pathname.replace("/", "");

    browser.storage.local.get(permalink).then((onGot, onError) => {
      const data = onGot[Object.keys(onGot)[0]];

      // Find badge element again within Promise#then
      const badge = document.querySelector(
        "[href='/" + data["permalink"] + "']"
      ).parentElement.parentElement;

      appendDataToBadge(data, badge);
    });
  }
};

// Hides badge stats
hideStats = () => {
  if (contentDebugging) console.log("hideStats init");

  const userBadgeStats = document.querySelectorAll(".userBadgeListItem__stats");
  if (contentDebugging) console.log(userBadgeStats);

  for (let i = 0; i < userBadgeStats.length; i++) {
    userBadgeStats[i].setAttribute("class", "userBadgeListItem__stats--hidden");
  }
};

// Displays previously hidden badge stats
showStats = () => {
  if (contentDebugging) console.log("showStats init");

  const userBadgeStats = document.querySelectorAll(
    ".userBadgeListItem__stats--hidden"
  );
  if (contentDebugging) console.log(userBadgeStats);

  for (let i = 0; i < userBadgeStats.length; i++) {
    userBadgeStats[i].setAttribute("class", "userBadgeListItem__stats");
  }
};

// Conditionally hides or displays badge stats based on user preference
contentMain = () => {
  if (contentDebugging) console.log("contentMain init");
  if (!document.querySelector(".userNetwork")) return;

  browser.storage.local.get("status").then((onGot, onError) => {
    let status = onGot["status"] || "Enabled";

    if (contentDebugging) console.log("contentMain status: " + status);

    if (status == "Disabled") {
      hideStats();
    } else {
      showStats();
      parseBadges();
    }
  });
};

// Poll pages after page load
window.addEventListener("load", function(e) {
  setInterval(() => {
    contentMain();
  }, 500);
});

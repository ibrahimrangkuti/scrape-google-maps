async function getPlaceUrl() {
  return new Promise((resolve) => {
    const url = location.href;
    const interval = setInterval(() => {
      const currentUrl = location.href;
      if (currentUrl != url && currentUrl.match(/\/maps\/place\//)) {
        resolve(currentUrl);
        clearInterval(interval);
      }
    }, 200);
  });
}

function getCoordinateFromUrl(url) {
  const lat = parseFloat(url.match(/!3d(-?\d+\.\d+)/)[1]).toFixed(5);
  const long = parseFloat(url.match(/!4d(-?\d+\.\d+)/)[1]).toFixed(5);

  console.log({ lat, long });
  return { lat, long };
}

function zoomInMap() {
  const zoomInButton = document.querySelector(".widget-zoom-in");
  zoomInButton.click();
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function search(keyword) {
  const input = document.getElementById("searchboxinput");
  const btn = document.getElementById("searchbox-searchbutton");
  input.value = keyword;
  zoomInMap();
  await delay(3000);
  btn.click();
  const url = await getPlaceUrl();
  return { keyword, url, ...getCoordinateFromUrl(url) };
}

async function searchAll(keywords) {
  const result = [];
  for (const keyword of keywords) {
    result.push(await search(keyword));
  }
  return result;
}

function downloadCSV(csvData, filename) {
  const csvString = csvData.map((row) => row.join(",")).join("\n");
  const blob = new Blob([csvString], { type: "text/csv" });

  if (navigator.msSaveBlob) {
    // For Internet Explorer
    navigator.msSaveBlob(blob, filename);
  } else {
    const link = document.createElement("a");
    if (link.download !== undefined) {
      // For modern browsers
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

async function main() {
  // Masukkan keyword. cth: "SMKN 5 Kab. Tangerang", "SMKN 2 Kab. Tangerang", dst
  const keywords = [];

  const results = await searchAll(keywords);
  const csvData = [
    ["Keyword", "Lat", "Long"],
    ...results.map((item) => [item.keyword, item.lat, item.long]),
  ];
  downloadCSV(csvData, "locations.csv");
}

main();

// functionality for showing/hiding the comments section

var showHideBtn = document.querySelector('.show-hide');
var commentWrapper = document.querySelector('.comment-wrapper');

commentWrapper.style.display = 'none';

showHideBtn.onclick = () => {
  var showHideText = showHideBtn.textContent;
  if(showHideText == 'Show comments') {
    showHideBtn.textContent = 'Hide comments';
    commentWrapper.style.display = 'block';
  } else {
    showHideBtn.textContent = 'Show comments';
    commentWrapper.style.display = 'none';
  }
};

// functionality for adding a new comment via the comments form

var form = document.querySelector('.comment-form');
var nameField = document.querySelector('#name');
var commentField = document.querySelector('#comment');
var list = document.querySelector('.comment-container');

form.onsubmit = (e) => {
  e.preventDefault();
  var listItem = document.createElement('li');
  var namePara = document.createElement('p');
  var commentPara = document.createElement('p');
  var nameValue = nameField.value;
  var commentValue = commentField.value;

  namePara.textContent = nameValue;
  commentPara.textContent = commentValue;

  list.appendChild(listItem);
  listItem.appendChild(namePara);
  listItem.appendChild(commentPara);

  nameField.value = '';
  commentField.value = '';
};

// Function to fetch the image URLs based on the file names
var baseUrl = "https://en.wikipedia.org/w/api.php";
var title = "List_of_ursids";

var params = {
    action: "parse",
    page: title,
    prop: "wikitext",
    section: 3,
    format: "json",
    origin: "*"
};

fetchImageUrl = async (fileName) =>{
  var imageParams = {
      action: "query",
      titles: `File:${fileName}`,
      prop: "imageinfo",
      iiprop: "url",
      format: "json",
      origin: "*"
  };

  var url = `${baseUrl}?${new URLSearchParams(imageParams).toString()}`;
  var res = await fetch(url);
  var data = await res.json();
  var pages = data.query.pages;
  var imageUrl = Object.values(pages)[0].imageinfo[0].url;
  return imageUrl;
}

// Function to extract bear data from the wikitext
extractBears = (wikitext) => {
  var speciesTables = wikitext.split('{{Species table/end}}');
  var bears = [];

  speciesTables.forEach((table) => {
    var rows = table.split('{{Species table/row');
    rows.forEach(async (row) => {
      var nameMatch = row.match(/\|name=\[\[(.*?)\]\]/);
      var binomialMatch = row.match(/\|binomial=(.*?)\n/);
      var imageMatch = row.match(/\|image=(.*?)\n/);

      if (nameMatch && binomialMatch && imageMatch) {
        var fileName = imageMatch[1].trim().replace('File:', '');

        // Fetch the image URL and handle the bear data
        var imageUrl = await fetchImageUrl(fileName);
        var bear = {
          name: nameMatch[1],
          binomial: binomialMatch[1],
          image: imageUrl,
          range: "TODO extract correct range"
        };
        bears.push(bear);

        // Only update the UI after all bears are processed
        if (bears.length === rows.length) {
          var moreBearsSection = document.querySelector('.more_bears');
          bears.forEach((bear) => {
            moreBearsSection.innerHTML += `
                <div>
                    <h3>${bear.name} (${bear.binomial})</h3>
                    <img src="${bear.image}" alt="${bear.name}" style="width:200px; height:auto;">
                    <p><strong>Range:</strong> ${bear.range}</p>
                </div>
            `;
          });
        }
      }
    });
  });
}

getBearData = async () => {
  var url = `${baseUrl}?${new URLSearchParams(params).toString()}`;
  var res = await fetch(url);
  var data = await res.json();
  var wikitext = data.parse.wikitext['*'];
  extractBears(wikitext); // No need to handle promises here
}

// Fetch and display the bear data
getBearData();

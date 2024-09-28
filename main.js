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

fetchImageUrl = async (fileName) => {
  try {
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
    var page = Object.values(pages)[0];

    if (page.imageinfo && page.imageinfo.length > 0) {
      var imageUrl = page.imageinfo[0].url;
      return imageUrl;
    } else {
      console.error(`No image info found for ${fileName}`);
      return null;
    }
  } catch (error) {
    console.error('Error fetching image URL:', error);
    return null;
  }
}

// function to check if an image URL is available
isImageAvailable = (url) => {
  return new Promise((resolve) => {
    var img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

// Function to extract bear data from the wikitext
extractBears = async (wikitext) => {
  console.log('wikitext:', wikitext);
  var speciesTables = wikitext.split('{{Species table/end}}');
  var bears = [];
  var bearPromises = [];

  speciesTables.forEach((table) => {
    var rows = table.split('{{Species table/row');
    rows.forEach((row) => {
      bearPromises.push(processRow(row));
    });
  });

  await Promise.all(bearPromises);

  // After all bears are processed, update the UI
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

  async function processRow(row) {
      try {
        var nameMatch = row.match(/\|name=\[\[(.*?)\]\]/);
        var binomialMatch = row.match(/\|binomial=(.*?)\n/);
        var imageMatch = row.match(/\|image=(.*?)\n/);
        var rangeMatch = row.match(/\|range=(.*?)(\(|\||\n)/);

        if (nameMatch && binomialMatch && imageMatch) {
          var fileName = imageMatch[1].trim().replace('File:', '');

          // Fetch the image URL and handle the bear data
          var imageUrl = await fetchImageUrl(fileName);

          // force an invalid image URL to simulate missing images
          // uncomment the line below to test the placeholder image:
          //imageUrl = 'https://invalid-url.com/nonexistent-image.jpg';

          // Default to placeholder if image URL is not available
          if (!imageUrl) {
            console.log(`Image URL not found for ${nameMatch[1]}, using placeholder.`);
            imageUrl = 'media/placeholder.png';
          } else {
            // check if the image URL is available
            var isAvailable = await isImageAvailable(imageUrl);
            if (!isAvailable) {
              console.log(`Image not available for ${nameMatch[1]}, using placeholder.`);
              imageUrl = 'media/placeholder.png';
            }
          }
          var bear = {
            name: nameMatch[1],
            binomial: binomialMatch[1],
            image: imageUrl,
            range: rangeMatch ? rangeMatch[1].trim() : 'No range data available'
          };
          bears.push(bear);
        }
      } catch (error) {
        console.error('Error processing row:', error);
      }
  }
}

getBearData = async () => {
  var url = `${baseUrl}?${new URLSearchParams(params).toString()}`;
  try {
    var res = await fetch(url);
    var data = await res.json();
    var wikitext = data.parse.wikitext['*'];
    extractBears(wikitext); // No need to handle promises here
  } catch (error) {
    console.error('Error fetching bear data:', error);
  }
}

// Fetch and display the bear data
getBearData();

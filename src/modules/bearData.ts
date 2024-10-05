// Function to fetch the image URLs based on the file names
const baseUrl = "https://en.wikipedia.org/w/api.php";
const title = "List_of_ursids";

const params = {
    action: "parse",
    page: title,
    prop: "wikitext",
    section: 3,
    format: "json",
    origin: "*"
};

const fetchImageUrl = async (fileName: string): Promise<string | null> => {
    try {
        const imageParams = {
            action: "query",
            titles: `File:${fileName}`,
            prop: "imageinfo",
            iiprop: "url",
            format: "json",
            origin: "*"
        };

        const url = `${baseUrl}?${new URLSearchParams(imageParams).toString()}`;
        const res = await fetch(url);
        const data = await res.json();
        const pages = data.query.pages;
        const page = Object.values(pages)[0] as { imageinfo?: { url: string }[] };

        if (page.imageinfo && page.imageinfo.length > 0) {
            return page.imageinfo[0].url;
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
const isImageAvailable = (url: string): Promise<boolean> => {
    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
    });
}

// Function to extract bear data from the wikitext
const extractBears = async (wikitext: string): Promise<void> => {
    console.log('wikitext:', wikitext);
    const speciesTables = wikitext.split('{{Species table/end}}');
    const bears: { name: string; binomial: string; image: string; range: string }[] = [];
    const bearPromises: Promise<void>[] = [];

    speciesTables.forEach((table) => {
        const rows = table.split('{{Species table/row');
        rows.forEach((row) => {
            bearPromises.push(processRow(row));
        });
    });

    await Promise.all(bearPromises);

    // After all bears are processed, update the UI
    const moreBearsSection = document.querySelector('.more_bears') as HTMLElement | null;
    bears.forEach((bear) => {
        if (moreBearsSection) {
            moreBearsSection.innerHTML += `
            <div>
                <h3>${bear.name} (${bear.binomial})</h3>
                <img src="${bear.image}" alt="${bear.name}" style="width:200px; height:auto;">
                <p><strong>Range:</strong> ${bear.range}</p>
            </div>
        `;
        }
    });

    async function processRow(row: string): Promise<void> {
        try {
            const nameMatch = row.match(/\|name=\[\[(.*?)\]\]/);
            const binomialMatch = row.match(/\|binomial=(.*?)\n/);
            const imageMatch = row.match(/\|image=(.*?)\n/);
            const rangeMatch = row.match(/\|range=(.*?)(\(|\||\n)/);

            if (nameMatch && binomialMatch && imageMatch) {
                const fileName = imageMatch[1].trim().replace('File:', '');

                // Fetch the image URL and handle the bear data
                let imageUrl = await fetchImageUrl(fileName);

                // force an invalid image URL to simulate missing images
                // uncomment the line below to test the placeholder image:
                //imageUrl = 'https://invalid-url.com/nonexistent-image.jpg';

                // Default to placeholder if image URL is not available
                if (!imageUrl) {
                    console.log(`Image URL not found for ${nameMatch[1]}, using placeholder.`);
                    imageUrl = 'media/placeholder.png';
                } else {
                    // check if the image URL is available
                    const isAvailable = await isImageAvailable(imageUrl);
                    if (!isAvailable) {
                        console.log(`Image not available for ${nameMatch[1]}, using placeholder.`);
                        imageUrl = 'media/placeholder.png';
                    }
                }
                const bear = {
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

const getBearData = async (): Promise<void> => {
    const url = `${baseUrl}?${new URLSearchParams(params).toString()}`;
    try {
        const res = await fetch(url);
        const data = await res.json();
        const wikitext = data.parse.wikitext['*'];
        extractBears(wikitext); // No need to handle promises here
    } catch (error) {
        console.error('Error fetching bear data:', error);
    }
}

export { getBearData };

const https = require('https');
var reviews = [];
const fs = require('fs');

const countries = ['ae', 'ag', 'ai', 'al', 'am', 'ao', 'ar', 'at', 'au', 'az', 'bb', 'be', 'bf', 'bg', 'bh', 'bj', 'bm', 'bn', 'bo', 'br', 'bs', 'bt', 'bw', 'by', 'bz', 'ca', 'cg', 'ch', 'cl', 'cn', 'co', 'cr', 'cv', 'cy', 'cz', 'de', 'dk', 'dm', 'do', 'dz', 'ec', 'ee', 'eg', 'es', 'fi', 'fj', 'fm', 'fr', 'gb', 'gd', 'gh', 'gm', 'gr', 'gt', 'gw', 'gy', 'hk', 'hn', 'hr', 'hu', 'id', 'ie', 'il', 'in', 'is', 'it', 'jm', 'jo', 'jp', 'ke', 'kg', 'kh', 'kn', 'kr', 'kw', 'ky', 'kz', 'la', 'lb', 'lc', 'lk', 'lr', 'lt', 'lu', 'lv', 'md', 'mg', 'mk', 'ml', 'mn', 'mo', 'mr', 'ms', 'mt', 'mu', 'mw', 'mx', 'my', 'mz', 'na', 'ne', 'ng', 'ni', 'nl', 'no', 'np', 'nz', 'om', 'pa', 'pe', 'pg', 'ph', 'pk', 'pl', 'pt', 'pw', 'py', 'qa', 'ro', 'ru', 'sa', 'sb', 'sc', 'se', 'sg', 'si', 'sk', 'sl', 'sn', 'sr', 'st', 'sv', 'sz', 'tc', 'td', 'th', 'tj', 'tm', 'tn', 'tr', 'tt', 'tw', 'tz', 'ua', 'ug', 'us', 'uy', 'uz', 'vc', 've', 'vg', 'vn', 'ye', 'za', 'zw']

const getCsv = function (reviews) {
    var s = "";
    let header = Object.keys(reviews[0]).join('\t');
    s += header + "\n";
    reviews.forEach((review) => {
        let val = Object.values(review).join('\t');
        s += val + "\n";
    })

    fs.writeFile('reviews.txt', s, function (err) {
        if (err) throw err;
        console.log('Saved!');
    });

}

const getInfoReview = function (entry) {
    var info = {
        id: entry.id.label,
        title: entry.title.label,
        author: entry.author.name.label,
        author_url: entry.author.uri.label,
        version: entry['im:version'].label,
        rating: entry['im:rating'].label,
        review: entry.content.label,
        vote_count: entry['im:voteCount'].label
    }
    return info;
}

const getReviewsJsonFromApi = function (id, page, country) {
    return new Promise((resolve, reject) => {
        let url = `https://itunes.apple.com/rss/customerreviews/id=${id}/page=${page}/sortby=mostrecent/json?cc=${country}`

        https.get(url, (resp) => {
            let data = '';

            resp.on('data', (chunk) => {
                data += chunk;
            });

            resp.on('end', () => {
                try {
                    resolve(JSON.parse(data).feed);
                } catch (err) {
                    resolve()
                }
            });

        }).on("error", (err) => {
            reject(err);
        });
    })

}


const getReviews = function (appId, page, countryIdx) {
    var country = countries[countryIdx]
    getReviewsJsonFromApi(appId, page, country).then((res) => {
        page++;
        if (res != undefined && res.entry && res.entry.length > 0) {
            reviews = reviews.concat(res.entry.map((x) => { return getInfoReview(x) }));
            getReviews(appId, page, countryIdx);
        } else {
            countryIdx++;
            page = 1;
            if(countryIdx < countries.length)
            {
                getReviews(appId, page, countryIdx)
            }else{
                getCsv(reviews);
            }
           
            //getCsv(reviews);
        }
    }).catch((err) => {
        console.log(err);
    })
}
const appId = ''
getReviews(appId, 1, 1);
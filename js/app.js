const YOUTUBE_SEARCH_URL = 'https://www.googleapis.com/youtube/v3/search';
const API_KEY = 'AIzaSyCLeJQoGA1Zn8dKKofZo41swOloXIcUefg';
let search_term = null;

const isiOS = navigator.userAgent.match(/(iPad)|(iPhone)|(iPod)/i) != null //boolean check for iOS devices

const youtubelightbox = document.getElementById('youtubelightbox')
let player // variable to hold new YT.Player() instance

// Hide lightbox when clicked on
youtubelightbox.addEventListener('click', function(){
    this.style.display = 'none'
    player.stopVideo()
}, false)

// Exclude youtube iframe from above action
youtubelightbox.querySelector('.centeredchild').addEventListener('click', function(e){
    e.stopPropagation()
}, false)


// define onYouTubeIframeAPIReady() function and initialize lightbox when API is ready
function onYouTubeIframeAPIReady() {
    createlightbox()
}

// API CALL
function getDataFromApi(searchTerm, pagekey, callback){
  search_term = searchTerm;
  const query = {
    part: 'snippet',
    key: API_KEY,
    q: `${searchTerm} in:title`,
    type: 'video',
    maxResults: 6,
    pageToken: pagekey
  }

  $.getJSON(YOUTUBE_SEARCH_URL, query, callback);
}


// RENDER RESULTS
function renderResult(result){
  const videoID = result.id.videoId;
  const channelID = result.snippet.channelId;

return `
    <div class="search-item">
        <a class="video lightbox" href="https://youtube.com/watch?v=${videoID}" data-videoid=${videoID} onclick="createlightbox(); console.log(\'lightbox\'); return false"><img src="${result.snippet.thumbnails.medium.url}"></a>
        <div class="video-title">${result.snippet.title}</div>
        <div class="video-description">${result.snippet.description}</div>
        <div class="channel-title">View more by <a href="https://youtube.com/channel/${channelID}" target="_blank">${result.snippet.channelTitle}</a></div>
    </div>
  `
}

function displayYouTubeSearchData(data){
  const results = data.items.map((item, index) => renderResult(item));
  // console.log(data);
  $('.js-results').html(results);
  $('.js-total-results').html(`${data.pageInfo.totalResults} result(s) found`);
  getNextPage(data.nextPageToken);
  getPrevPage(data.prevPageToken);
}

// PAGES
function getNextPage(pageToken){
  console.log(`Next Page Token: ${pageToken}`);
  if (!$('#nextPage').hasClass("hidden")){
    $('#nextPage').addClass("hidden");
  }

  if (pageToken !== null && pageToken !== undefined){
    $('#nextPage').removeClass("hidden");
    $('#nextPage').on('click', function(event){
      getDataFromApi(search_term, pageToken, displayYouTubeSearchData);
    })
  }
}

function getPrevPage(pageToken){
  console.log(`Prev Page Token: ${pageToken}`);
  $('#prevPage').addClass("hidden");
  if (pageToken !== null && pageToken !== undefined){
    $('#prevPage').removeClass("hidden");
    $('#prevPage').on('click', function(event){
      getDataFromApi(search_term, pageToken, displayYouTubeSearchData);
    })
  }
}

// Extracts the Youtube video ID from a well formed Youtube URL
function getyoutubeid(link){
    var youtubeidreg = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/ ]{11})/i;
    return youtubeidreg.exec(link)[1] // return Youtube video ID portion of link
}

// Creates a new YT.Player() instance
function createyoutubeplayer(videourl){
    player = new YT.Player('playerdiv', {
        videoId: videourl,
        playerVars: {autoplay:1}
    })
}

// Main Youtube lightbox function
function createlightbox(){
    var targetlinks = document.querySelectorAll('.lightbox')
    for (var i=0; i<targetlinks.length; i++){
        var link = targetlinks[i]
        link._videoid = getyoutubeid(link) // store youtube video ID portion of link inside _videoid property
        targetlinks[i].addEventListener('click', function(e){
            youtubelightbox.style.display = 'block'
            if (typeof player == 'undefined'){ // if video player hasn't been created yet
                createyoutubeplayer(this._videoid)
            }
            else{
                if (isiOS){ // iOS devices can only use the "cue" related methods
                    player.cueVideoById(this._videoid)
                }
                else{
                    player.loadVideoById(this._videoid)
                }
            }
            e.preventDefault()
        }, false)
    }
}



// EVENT LISTENER
function watchSubmit() {
  $('.js-search-form').submit(function(event){
    event.preventDefault();
    const queryTarget = $(event.currentTarget).find('.js-query');
    const query = queryTarget.val();
    console.log(`submited search query: ${query}`);
    queryTarget.val("");  //clears input

    getDataFromApi(query, null, displayYouTubeSearchData)
  })
}

$(watchSubmit)

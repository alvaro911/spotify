function renderD3(){
  let chart = document.getElementById('chart')
  const width = chart.offsetWidth
      height = window.innerHeight
  const MOBILE = 400
  let saveThisArtist

  const svg = d3.select('#chart')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .append('g')
    .attr('transform', `translate(${width/2},${height/2})`)

  const radiousScale = d3.scaleSqrt().domain([1, 100]).range([1,30])


  const simulation = d3.forceSimulation()
    .force('x', d3.forceX(0).strength(1))
    .force('y', d3.forceY(0).strength(0.15))
    .force('collide', d3.forceCollide(function (d){
      return radiousScale(d.followers.total)/130 +2
    }))

  function getArtists(){
    console.log('hello')
    svg.selectAll("*").remove()
    // const genre = this.value
    // saveThisArtist = this.value
    const url=`https://api.spotify.com/v1/search?q=genre:"${saveThisArtist}"&type=artist&limit=50`
    d3.queue()
    .defer(d3.json, url)
    .await(ready)
  }

  const inputVals = d3.selectAll('button')
  inputVals.on('click', function(){
    saveThisArtist = this.value
    getArtists()
  })

  function ready(error, data){
    if(error) throw error

    const children = data.artists.items.map(item => {
      return {
        name: item.name,
        popularity: item.popularity,
        id:item.id,
        images:item.images,
        followers:item.followers
      }
    });

    const simulation = d3.forceSimulation()
      .force('x', d3.forceX(0).strength(0.15))
      .force('y', d3.forceY(0).strength(0.7))
      .force('collide', d3.forceCollide(function (d){
        return radiousScale(d.followers.total)/130 +2
      }))

    const defs = svg.append('defs')

    defs.selectAll('.artist-pattern')
      .data(children)
      .enter().append('pattern')
      .attr('class', '.artist-pattern')
      .attr('id', function (d){
        return d.name.toLowerCase().replace(/ /g, '-')
      })
      .attr('height', '100%')
      .attr('width', '100%')
      .attr('patternContentUnits', 'objectBoundingBox')
      .append('image')
      .attr('height',1)
      .attr('width',1)
      .attr('preserveAspectRatio', 'none')
      .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
      .attr('xlink:href', function(d){
        return d.images[1].url
      })

    const tool_tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([0, 0])
      .html(function(d) { return d.name })
      svg.call(tool_tip)

    const circles = svg.selectAll(data.artists.items.popularity)
      .data(children)
      .enter().append('circle')
      .attr('class','node')
      .attr('r', 0)
      .attr('fill', function(d) {
        return `url(#${d.name.toLowerCase().replace(/ /g, '-')})`
      })
      .on('click',function(d){
        document.getElementById('chart').style.display = 'none'
        tool_tip.hide()
        document.querySelector('.artist').style.display = 'flex'
        document.querySelector('.nav').style.display = 'none'
        artistInfo(d)
      })
      .on('mouseover', tool_tip.show)
      .on('mouseout', tool_tip.hide)

    function artistInfo(d){
      // this is for artists
      const artist = fetch(`https://api.spotify.com/v1/artists/${d.id}`)
        .then(res => res.json())
        .then(result => {
          return {
            artistName:result.name,
            artistImage:result.images[0].url,
            artistFollowers:result.followers.total
          }
      })

      const albums = fetch(`https://api.spotify.com/v1/artists/${d.id}/albums?limit=50&album_type=album`)
        .then(res => res.json())
        .then(result => {
          var unique = new Map()
          result.items.forEach(album =>{
            unique.set(album.name, album)
          })
        return Array.from(unique.values()).map((album)=>{
          return {
            albumName: album.name,
            ablumImage: album.images[1].url
          }
        })
      })

      Promise.all([artist, albums])
        .then(result => {
          const artist = result[0]
          const albums = result[1]
          var result = Object.assign({}, artist, {
            albums: albums
          });
          var artistHTML = document.querySelector('.artist')

          const artistInfo =`
            <div class="artist-info">
              <div class="artist-img">
                <img src="${result.artistImage}">
              </div>
              <div class="artist-label">
                <h2>${result.artistName}</h2>
                <h3>Followers: ${result.artistFollowers}</h3>
              </div>
            </div>
            <h2 class="header">Albums</h2>
            <span></span>
            <div class="albums"></div>
            <div class="close">
              <p>go back</p>
            </div>
          `

          artistHTML.innerHTML = artistInfo
          var albumHTML = document.querySelector('.albums')
          result.albums.forEach(album => {
            albumHTML.innerHTML = albumHTML.innerHTML + `
              <div class="album-info">
                <div class="album-img">
                  <img src="${album.ablumImage}">
                </div>
                <div class="album-name">
                  <p>${album.albumName}</p>
                </div>
              </div>
            `
          })
          document.querySelector('.close').addEventListener('click',() => {
            document.getElementById('chart').style.display = 'block'
            document.querySelector('.artist').style.display = 'none'
            document.querySelector('.nav').style.display = 'flex'
          })
        })
    }

    const aniCircles = d3.selectAll('.node')

    aniCircles.transition()
      .duration(2000)
      .attr('r',function (d){
        return radiousScale(d.followers.total)/130
      })

    simulation.nodes(children).on('tick', ticked)

    let resizeTimer

    // window.addEventListener('resize', () => {
    //   clearTimeout(resizeTimer)
    //   resizeTimer = setTimeout(getArtists, 1000)
    // })

    function ticked(){
      // debugger
      circles
        .attr('cx', function(d){
          if(width > MOBILE){
            return d.x
          }
          else {
            return d.y
          }
        })
        .attr('cy',function(d){
          if(width > MOBILE){
            return d.y
          }
          else {
            return d.x
          }
        })
    }
  }
}
renderD3()

$(document).ready(() => {
  if(window.innerWidth < 737){
    $('.menu').on('click', () => {
      $('nav').show('slide', {direction: 'left'}, 250)
    })

    $('.nav button').on('click', () => {
      $('nav').hide('slide', {direction: 'left'}, 250)
    })
  }

})

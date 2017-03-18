(function(){
  var width=1100,
      height=600;

  var svg = d3.select('#chart')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .append('g')
    .attr('transform', `translate(${width/2},${height/2})`)

    var radiousScale = d3.scaleSqrt().domain([1, 100]).range([1,30])


  var simulation = d3.forceSimulation()
    .force('x', d3.forceX(0).strength(0.15))
    .force('y', d3.forceY(0).strength(0.75))
    .force('collide', d3.forceCollide(function (d){
      return radiousScale(d.followers.total)/130 +2
    }))


  var inputVals = d3.selectAll('button')
  inputVals.on('click', function(e){
    // e.preventDefault()
    svg.selectAll("*").remove()
    var genre = this.value
    var url=`https://api.spotify.com/v1/search?q=genre:"${genre}"&type=artist&limit=50`
    d3.queue()
    .defer(d3.json, url)
    .await(ready)

  })

  function ready(error, data){
    if(error) throw error

    var children = data.artists.items.map(item => {
      return {
        name: item.name,
        popularity: item.popularity,
        id:item.id,
        images:item.images,
        followers:item.followers
      }
    });

    var simulation = d3.forceSimulation()
      .force('x', d3.forceX(0).strength(0.15))
      .force('y', d3.forceY(0).strength(0.7))
      .force('collide', d3.forceCollide(function (d){
        return radiousScale(d.followers.total)/130 +2
      }))

    var defs = svg.append('defs')

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

    var tool_tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([0, 0])
      .html(function(d) { return d.name });
      svg.call(tool_tip);

    var circles = svg.selectAll(data.artists.items.popularity)
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
        document.querySelector('.artist').style.display = 'block'

        // make a function of this
        // this is for artists
        var artist = fetch(`https://api.spotify.com/v1/artists/${d.id}`)
          .then(res => res.json())
          .then(result => {
            return {
              artistName:result.name,
              artistImage:result.images[2].url
            }
        })

        var albums = fetch(`https://api.spotify.com/v1/artists/${d.id}/albums`)
          .then(res => res.json())
          .then(result => {
            return result.items.map((album)=>{
              return {
                albumName: album.name,
                ablumImage: album.images[1].url
              }
            })
        })

        Promise.all([artist, albums])
          .then(result => {
            var artist = result[0]
            var albums = result[1]
            var result = Object.assign({}, artist, {
              albums: albums
            });
            console.log(result)
          })

      })
      .on('mouseover', tool_tip.show)
      .on('mouseout', tool_tip.hide)

    var aniCircles = d3.selectAll('.node')

    aniCircles.transition()
      .duration(2000)
      .attr('r',function (d){
        return radiousScale(d.followers.total)/130
      })

    simulation.nodes(children).on('tick', ticked)

    function ticked(){
      circles
        .attr('cx', function(d){
          return d.x
        })
        .attr('cy',function(d){
          return d.y
        })
    }
  }
})()

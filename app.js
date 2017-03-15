(function(){
  var width=600,
      height=600;

  var svg=d3.select('#chart')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .append('g')
    .attr('transform', 'translate(0,0)')

    var radiousScale = d3.scaleSqrt().domain([1, 100]).range([1,30])


  var simulation = d3.forceSimulation()
    .force('x', d3.forceX(width / 2).strength(0.05))
    .force('y', d3.forceY(height / 2).strength(0.05))
    .force('collide', d3.forceCollide(function (d){
      return radiousScale(d.followers.total)/130 +2
    }))

  var url='https://api.spotify.com/v1/search?q=genre:hiphop&type=artist&limit=50'
  d3.queue()
    .defer(d3.json, url)
    .await(ready)

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

    var defs = svg.selectAll(data.artists.items.popularity)
    defs.selectAll('.artists-pattern')
        .data(children)
        .enter().append('pattern')
        .attr('class','artists-pattern')
        .attr('id', function(d) {return d.name})
        .attr('height', '100%')
        .attr('width', '100%')
        .attr('patternContentUnits', 'objectBoundingBox')
        .append('image')
        .attr('height', 1)
        .attr('width', 1)
        .attr('preserveAspectRation', 'none')
        .attr('xmlns:xlink', 'http://www.w3.org/1999/xlink')
        .attr('xlink:href', function(d) {return d.images[1].url})

    var circles = svg.selectAll(data.artists.items.popularity)
      .data(children)
      .enter().append('circle')
      .attr('class','node')
      .attr('r',function (d){
        return radiousScale(d.followers.total)/130
      })
      // .attr('fill', '#bada55')
      .attr('fill', function(d) {
        if(d.followers.total > 0 && d.followers.total < 100000){
          return '#e74c3c'
        }else if(d.followers.total > 100001 && d.followers.total < 300000){
          return '#9b59b6'
        }else if(d.followers.total > 300001 && d.followers.total < 600000){
          return '#e67e22'
        }else if(d.followers.total > 600001 && d.followers.total < 1000000){
          return '#f1c40f'
        }else if(d.followers.total > 1000001 && d.followers.total < 2000000){
          return '#3498db'
        }else{
          return '#2ecc71'
        }
      })
      .on('click',function(d){
        console.log(d)
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

(function(){
  var width=960,
      height=600;

  var svg=d3.select('#chart')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .append('g')
    .attr('transform', 'translate(0,0)')

    var radiousScale = d3.scaleSqrt().domain([1, 100]).range([1,30])

  var url='https://api.spotify.com/v1/search?q=genre:alternativemetal%20year:2009&type=artist&limit=50'

  var simulation = d3.forceSimulation()
    .force('x', d3.forceX(width / 2).strength(0.05))
    .force('y', d3.forceY(height / 2).strength(0.05))
    .force('collide', d3.forceCollide(function (d){
      return radiousScale(d.followers.total)/100
    }))

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

    var circles = svg.selectAll(data.artists.items.popularity)
      .data(children)
      .enter().append('circle')
      .attr('class','node')
      .attr('r',function (d){
        return radiousScale(d.followers.total)/100
      })
      .attr('fill','rgb(191, 158, 31)')
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

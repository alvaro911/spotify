(function(){
  var width=600,
      height=600;

  var svg=d3.select('#chart')
    .append('svg')
    .attr('height', height)
    .attr('width', width)
    .append('g')
    .attr('transform', `translate(${width/2},${height/2})`)

    var radiousScale = d3.scaleSqrt().domain([1, 100]).range([1,30])


  var simulation = d3.forceSimulation()
    .force('x', d3.forceX(0).strength(0.4))
    .force('y', d3.forceY(0).strength(0.4))
    .force('collide', d3.forceCollide(function (d){
      return radiousScale(d.followers.total)/130 +2
    }))


  var inputVals = d3.selectAll('button')
  inputVals.on('click', function(e){
    // e.preventDefault()
    var genre = this.value
    console.log(genre)
    var url='https://api.spotify.com/v1/search?q=genre:'+genre+'&type=artist&limit=50'
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

    var circles = svg.selectAll(data.artists.items.popularity)
      .data(children)
      .enter().append('circle')
      .attr('class','node')
      .attr('r',function (d){
        return radiousScale(d.followers.total)/130
      })
      .attr('fill', function(d) {
        return `url(#${d.name.toLowerCase().replace(/ /g, '-')})`
      })
      // .attr('fill', function(d) {
      //   if(d.followers.total > 0 && d.followers.total < 100000){
      //     return '#e74c3c'
      //   }else if(d.followers.total > 100001 && d.followers.total < 300000){
      //     return '#9b59b6'
      //   }else if(d.followers.total > 300001 && d.followers.total < 600000){
      //     return '#e67e22'
      //   }else if(d.followers.total > 600001 && d.followers.total < 1000000){
      //     return '#f1c40f'
      //   }else if(d.followers.total > 1000001 && d.followers.total < 2000000){
      //     return '#3498db'
      //   }else{
      //     return '#2ecc71'
      //   }
      // })
      .on('click',function(d){ console.log(d)})
      .on('mouseover', function(){
        tooltip.style('display', null)
      })
      .on('mouseout', function(){
        tooltip.style('display', 'none')
      })
      .on('mousemove', function(d){
        var xPos = d3.mouse(this)[0] - 30,
            yPos = d3.mouse(this)[1] - 55

        tooltip.attr('transform', `translate(${xPos}, ${yPos})`)
        tooltip.select('text').text(d.name)
      })

      var tooltip = svg.append('g')
        .attr('class', 'artist-pointer')
        .style('display', 'none')

      tooltip.append('text')
        .attr('x', 15)
        .attr('dy', '1.2em')
        .style('font-size', '1em')
        .attr('background-color', 'white');

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

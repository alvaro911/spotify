var svg = d3.select("svg"),
    width = svg.attr("width"),
    height = svg.attr("height");

var format = d3.format(",d");

var pack = d3.pack()
    .size([width - 2, height - 2])
    .padding(10);

var url='https://api.spotify.com/v1/search?q=genre:%22rap%20%22&type=artist&limit=50'

d3.json(url, function(error,data){
  // console.log(data);
  if(error) throw error;
  var nodes = d3.hierarchy({artists:data.artists.items})
        .sum(function(d){return d.popularity});
  console.log(nodes)

  // var root = d3.hierarchy({children: data})
  //     .sum(function(d) { return d.value; })
  //     .sort(function(a, b) { return b.value - a.value; });
  //
  // pack(root);


  // var node = svg.select("g")
  //   .selectAll("g")
  //   .data(data.artists.item)
  //   .enter().append("g")
  //     .attr("transform", function(d) { return "translate(" + d.x + "," + d.y + ")"; })
  //     .attr("class", "node");
  //
  // node.append("circle")
  //     .attr("id", function(d) { return "node-" + d.data.artists.items; })
  //     .attr("r", function(d) { return d.popularity; });
  //
  // node.append("clipPath")
  //     .attr("id", function(d) { return "clip-" + d.data.artists.items; })
  //   .append("use")
  //     .attr("xlink:href", function(d) { return "#node-" + d.data.id + ""; });
  //
  // node.append("text")
  //     .attr("clip-path", function(d) { return "url(#clip-" + d.data.id + ")"; })
  //   .selectAll("tspan")
  //     .data(function(d) { return d.data.id.split(".").pop().split(/(?=[A-Z][^A-Z])/g); })
  //   .enter().append("tspan")
  //     .attr("x", 0)
  //     .attr("y", function(d, i, nodes) { return 13 + (i - nodes.length / 2 - 0.5) * 10; })
  //     .text(function(d) { return d; });
  //
  // node.append("title")
  //     .text(function(d) { return d.data.id + "\n" + format(d.value); });
  //

})

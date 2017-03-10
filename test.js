var data = require('./artists');
// console.log(data.artists);
// data.artists.items.forEach(artist => {
//   console.log(artist);
// })

var children = data.artists.items.map(item => {
  return {
    name: item.name,
    popularity: item.popularity
  }
});

var root = {
  name: 'artists',
  children: children
}

console.log(root)

var albums = require('./albums')
var result = albums.items.map((album)=>{
  return {
    albumName: album.name,
    ablumImage: album.images[1].url
  }
})

console.log(result)

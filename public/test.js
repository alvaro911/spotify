const axios = require('axios');

axiost.get('/search', {
  params: {
    genre: 'rock',
  }
})
  .then(res => {
    console.log('genre result 'res);
  })
  .catch(err => {
    console.log(err);
  })

'use strict';

const express = require('express');
const server = express();

const PORT = 9876;

server.listen(PORT, () =>
  console.log(`canideploy server listening on port ${PORT}`)
);

const data = require('./data.js');

server.use(express.static(`${__dirname}/public`));

server.get('/:service.json', (req, res) => {
  const service = req.params['service'];

  if (Object.keys(data).indexOf(service) >= 0) {
    const result = data[service].reduce((acc, hold) => {
      if (hold.hold && hold.hold(new Date())) {
        acc.verdict = 'no';
        acc.reasons.push(hold.reason);
      } else if (hold.warn && hold.warn(new Date())) {
        if (acc.verdict === 'yes') {
          acc.verdict = 'maybe';
        }
        acc.reasons.push(hold.reason);
      } else if (hold.info && hold.info(new Date())) {
        acc.reasons.push(hold.reason);
      }
      return acc;
    }, { verdict: 'yes', reasons: [] });

    res.json(result);
  } else {
    res.status(404).json({});
  }
});

server.get('/*', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

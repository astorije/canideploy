'use strict';

const express = require('express');
const server = express();

const PORT = 9876;

try {
  var rules = require('./rules.js');
} catch (_) {
  console.error("Error: ./rules.js file was not found");
  process.exit(1);
}

server.listen(PORT, () =>
  console.log(`canideploy server listening on port ${PORT}`)
);

server.use(express.static(`${__dirname}/public`));

server.get('/:service.json', (req, res) => {
  const service = req.params['service'];

  if (Object.keys(rules).indexOf(service) >= 0) {
    const result = rules[service].reduce((acc, rule) => {
      if (rule.hold && rule.hold(new Date())) {
        acc.verdict = 'no';
        acc.messages.push(rule.message);
      } else if (rule.warn && rule.warn(new Date())) {
        if (acc.verdict === 'yes') {
          acc.verdict = 'maybe';
        }
        acc.messages.push(rule.message);
      } else if (rule.info && rule.info(new Date())) {
        acc.messages.push(rule.message);
      }
      return acc;
    }, { verdict: 'yes', messages: [] });

    res.json(result);
  } else {
    res.status(404).json({});
  }
});

server.get('/*', function(req, res){
  res.sendFile(__dirname + '/public/index.html');
});

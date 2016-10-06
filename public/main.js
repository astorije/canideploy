'use strict';

const input = document.querySelector('#service');

(service => {
  if (service.length > 0) {
    handleService(service);
    input.value = service;
  } else {
    input.focus();
  }
})(window.location.pathname.substr(1));

input.onkeyup = () => {
  let service = input.value;

  window.history.replaceState(service, '', `/${service}`);

  handleService(service);
};

window.setInterval(() => {
  let service = input.value;
  handleService(service);
}, 30000);

function handleService(service) {
  if (service.length > 0) {
    fetch(`/${service}.json`)
      .then(response => response.json())
      .then(json => updateUI(json));
  } else {
    updateUI({});
  }
}

function updateUI(json) {
  const verdicts = {
    'no': 'No!',
    'maybe': 'Maybe...',
    'yes': 'Yes!',
  }

  const bodyClasses = {
    'no': 'no-deploy',
    'maybe': 'maybe-deploy',
    'yes': 'deploy',
  }

  document.querySelector('body').className = (bodyClasses[json.verdict] || '');
  document.querySelector('#verdict').innerHTML = (verdicts[json.verdict] || '');
  document.querySelector('#reasons').innerHTML = formatReasons(json.reasons);
}

function formatReasons(reasons) {
  return (reasons || []).map((reason, index) => {
    if (index > 0) {
      reason = reason.charAt(0).toLowerCase() + reason.slice(1);
    }
    return `${reason}<br>`;
  }).join('And ');
}

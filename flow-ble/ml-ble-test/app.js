var canvas = document.querySelector('canvas');
var statusText = document.querySelector('#statusText');
var responseText = document.querySelector('#responseText');
var button = document.querySelector('#selectButton');


function startConnect() {
  statusText.textContent = 'Waiting for notifications...';

  manylabsBle.connect()
  .then(() => manylabsBle.startNotificationsHttpStatus().then(handleHttpStatus))
  .then(() => manylabsBle.requestGet())
  .catch(error => {
    console.log("apps.js: manylabsBle.connect error")
    statusText.textContent = error;
  });
}

function clear() {
  responseText.textContent = "";
}

function formatTime(dt) {
  var ts = dt.format("dd/MM/yyyy HH:mm:ss fff");
  return ts;
}

button.addEventListener('click', function() {
  manylabsBle.connect()
  .then( () =>  {
    statusText.textContent = 'Waiting for notifications...';
  })
  .then(() => manylabsBle.startNotificationsHttpStatus().then(handleHttpStatus))
  .then(() => manylabsBle.requestGet())
  .catch(error => {
    console.log("apps.js: manylabsBle.connect error")
    statusText.textContent = error;
  });
});


function handleHttpStatus(httpStatus) {
  console.log("handleHttpStatus")
  httpStatus.addEventListener('characteristicvaluechanged', event => {
    console.log("handleHttpStatus.event characteristicvaluechanged")
    //console.log("event.target.value=" + event.target.value);
    var value = event.target.value;
    // In Chrome 50+, a DataView is returned instead of an ArrayBuffer.
    value = value.buffer ? value : new DataView(value);
    let http_status = value.getUint8(0);
    options = { hour12: false }
    var ts = new Date();
    var dt_prefix = ts.toLocaleTimeString('en-US', options) + ": ";
    statusText.innerHTML = dt_prefix + "<br/>HTTP Status=" + http_status;
    if (http_status == manylabsBle.STATUS_BIT_BODY_RECEIVED)  {
      // retrieve http body
      console.log("handleHttpStatus.event: Retrieving body......");
      manylabsBle.getHttpBody().then(body => {
        console.log("getHttpBody.body 1: " + body);
        responseText.innerHTML += "<br/>";
        //responseText.innerHTML += ts.toLocaleTimeString('en-US', options) + "." + (ts.getTime() % 999) + ": " + body;
        responseText.innerHTML += dt_prefix + body;
     });

    } else if (http_status == manylabsBle.STATUS_BIT_BODY_TRUNCATED)  {
      // retrieve http body
      console.log("handleHttpStatus.event2: Retrieving body......");
        manylabsBle.getHttpBody().then(body => {
          console.log("getHttpBody.body 2: " + body);
          responseText.innerHTML += "<br/>";
          //responseText.innerHTML += ts.toLocaleTimeString('en-US', options) + "." + (ts.getTime() % 999) + ": " + body;
          responseText.innerHTML += dt_prefix + body;
          return body.length
        });

    } else {
      console.log("handleHttpStatus.event: Body not received: http_status=" + http_status);
    }
  });
}

var mode = 'bar';



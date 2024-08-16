<?php
  // Handles device authorization request.

  $start = microtime(true);

  // Load configuration.
  require('../../../config.php');

  // Get device authorization request.
  $deviceAuthorizationRequest = curl_init($AUTHLETE_CONFIG['DEVICE_AUTHORIZATION_ENDPOINT']);
  curl_setopt($deviceAuthorizationRequest, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($deviceAuthorizationRequest, CURLOPT_POST, true);
  curl_setopt($deviceAuthorizationRequest, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Basic ' . base64_encode($AUTHLETE_CONFIG['API_KEY'] . ':' . $AUTHLETE_CONFIG['API_SECRET']),
  ]);
  curl_setopt($deviceAuthorizationRequest, CURLOPT_POSTFIELDS, json_encode(array(
    'parameters' => http_build_query($_POST),
    'clientId' => $AUTHLETE_CONFIG['CLIENT_ID'],
    // 'clientSecret' => $AUTHLETE_CONFIG['CLIENT_SECRET'],
  )));
  $res = curl_exec($deviceAuthorizationRequest);

  if ($res === false) {
    http_response_code(500);
    curl_close($deviceAuthorizationRequest);
    exit;
  }
  $response = json_decode($res);
  
  curl_close($deviceAuthorizationRequest);

  if ($response->action == 'OK') {
    http_response_code(200);
    header("Content-Type: X-www-form-urlencoded");
    echo $response->responseContent;
    file_put_contents('../../../logs.csv', "authorize_device,$elapsed_time\r\n", FILE_APPEND | LOCK_EX);
    exit;
  } else {
    http_response_code(500);
    echo "Unknown server error";
    exit;
  }
?>
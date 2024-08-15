<?php
  // Handles device authorization request.

  
  // Load configuration.
  require('../../config.php');
  
  // Get device authorization request.
  $deviceAuthorizationRequest = curl_init($AUTHLETE_CONFIG['DEVICE_AUTHORIZATION_ENDPOINT']);
  curl_setopt($deviceAuthorizationRequest, CURLOPT_POSTFIELDS, json_encode(array(
    'parameters' => urlencode($_POST),
    'clientId' => $AUTHLETE_CONFIG['CLIENT_ID'],
    // 'clientSecret' => $AUTHLETE_CONFIG['CLIENT_SECRET'],
  )));
  curl_setopt($deviceAuthorizationRequest, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json',
    'Authorization: Basic ' . base64_encode($AUTHLETE_CONFIG['API_KEY'] . ':' . $AUTHLETE_CONFIG['API_SECRET']),
  ));
  curl_setopt($deviceAuthorizationRequest, CURLOPT_RETURNTRANSFER, true);
  $response = json_decode(curl_exec($deviceAuthorizationRequest));
  
  if ($response->action == 'OK') {
    http_response_code(200);
    header("Content-Type: X-www-form-urlencoded");
    echo $response->responseContent;
    exit;
  } else {
    http_response_code(500);
    echo "Unknown server error";
    exit;
  }
?>
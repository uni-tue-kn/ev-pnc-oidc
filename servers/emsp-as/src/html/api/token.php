<?php
  // Handles Token Request.

  // Load configuration.
  require('../../config.php');

  // Send Token Request.
  $tokenRequest = curl_init($AUTHLETE_CONFIG['TOKEN_ENDPOINT']);
  curl_setopt($tokenRequest, CURLOPT_POSTFIELDS, json_encode(array(
    'parameters' => http_build_query($_POST),
    'clientId' => $AUTHLETE_CONFIG['CLIENT_ID'],
    'clientSecret' => $AUTHLETE_CONFIG['CLIENT_SECRET'],
  )));
  curl_setopt($tokenRequest, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json',
    'Authorization: Basic ' . base64_encode($AUTHLETE_CONFIG['API_KEY'] . ':' . $AUTHLETE_CONFIG['API_SECRET']),
  ));
  curl_setopt($tokenRequest, CURLOPT_RETURNTRANSFER, true);
  $response = json_decode(curl_exec($tokenRequest));

  // Check for success.
  if ($response->action == 'OK') {
    http_response_code(200);
    echo $response->responseContent;
    exit;
  } else if ($response->action == 'BAD_REQUEST') {
    http_response_code(400);
    echo $response->resultMessage;
    exit;
  } else {
    http_response_code(500);
    echo 'Unknown server error';
    exit;
  }
?>
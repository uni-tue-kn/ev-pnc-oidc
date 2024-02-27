<?php
  // Load configuration
  require('../config/config.php');

  // Register pushed authorization request.
  $pushedAuthorizationRequest = curl_init($AUTHLETE_CONFIG['PAR_ENDPOINT']);
  curl_setopt($pushedAuthorizationRequest, CURLOPT_POSTFIELDS, json_encode(array(
    'parameters' => http_build_query($_POST),
    'clientId' => $AUTHLETE_CONFIG['CLIENT_ID'],
    'clientSecret' => $AUTHLETE_CONFIG['CLIENT_SECRET'],
  )));
  curl_setopt($pushedAuthorizationRequest, CURLOPT_HTTPHEADER, array(
    'content-type: application/json',
    'authorization: Basic ' . base64_encode($AUTHLETE_CONFIG['API_KEY'] . ':' . $AUTHLETE_CONFIG['API_SECRET']),
  ));
  curl_setopt($pushedAuthorizationRequest, CURLOPT_RETURNTRANSFER, true);
  $response = json_decode(curl_exec($pushedAuthorizationRequest));

  // Check for success.
  if ($response->action !== 'CREATED') {
    echo $response->resultMessage;
    http_response_code(500);
    exit;
  }
  header('Content-Type: application/json; charset=utf-8');
  echo $response->responseContent;
?>

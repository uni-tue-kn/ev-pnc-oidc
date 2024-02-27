<?php
  // Handles pushed authorization request
  require('../../config.php');

  // Register pushed authorization request.
  $par = curl_init($AUTHLETE_CONFIG['PAR_ENDPOINT']);
  curl_setopt($par, CURLOPT_POSTFIELDS, json_encode(array(
    'parameters' => http_build_query($_POST),
    'clientId' => $AUTHLETE_CONFIG['CLIENT_ID'],
    'clientSecret' => $AUTHLETE_CONFIG['CLIENT_SECRET'],
  )));
  curl_setopt($par, CURLOPT_HTTPHEADER, array(
    'content-type: application/json',
    'authorization: Basic ' . base64_encode($AUTHLETE_CONFIG['API_KEY'] . ':' . $AUTHLETE_CONFIG['API_SECRET']),
  ));
  curl_setopt($par, CURLOPT_RETURNTRANSFER, true);
  $response = json_decode(curl_exec($par));

  // Check for success.
  if ($response['action'] !== 'CREATED') {
    http_response_code(500);
    exit;
  }

  // Return response.
  http_response_code(200);
  header('content-type: application/json');
  echo $response['responseContent'];
?>
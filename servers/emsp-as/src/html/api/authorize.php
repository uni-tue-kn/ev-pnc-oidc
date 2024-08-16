<?php
  // Handles Authorization Submission.

  $start = microtime(true);

  // Load configuration.
  require('../../config.php');

  // Get authorization request.
  $authorizationRequest = curl_init($AUTHLETE_CONFIG['AUTHORIZATION_ISSUE_ENDPOINT']);
  curl_setopt($authorizationRequest, CURLOPT_POSTFIELDS, json_encode(array(
    'ticket' => $_POST['ticket'],
    'subject' => 'john',
  )));
  curl_setopt($authorizationRequest, CURLOPT_HTTPHEADER, array(
    'content-type: application/json',
    'authorization: Basic ' . base64_encode($AUTHLETE_CONFIG['API_KEY'] . ':' . $AUTHLETE_CONFIG['API_SECRET']),
  ));
  curl_setopt($authorizationRequest, CURLOPT_RETURNTRANSFER, true);
  $response = json_decode(curl_exec($authorizationRequest));

  // Check for success.
  if ($response->action !== 'LOCATION') {
    echo $response->resultMessage;
    http_response_code(500);
    exit;
  }

  // Redirect to client.
  header('Location: ' . $response->responseContent);
  http_response_code(302);

  $end = microtime(true);
  $elapsed_time = $end - $start;
  file_put_contents('/logs/logs.csv', "authorize,$start,$end,$elapsed_time\r\n", FILE_APPEND | LOCK_EX);
?>
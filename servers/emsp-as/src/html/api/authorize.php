<?php
  // Handles Authorization Submission.

  // Load configuration.
  require('../config.php');

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
?>
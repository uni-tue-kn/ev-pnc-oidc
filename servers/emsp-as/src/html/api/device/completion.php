<?php
  // Handles device completion request where the resource owner grants authorization.

  // Check session state on validity.
  session_start();
  if (session_status() !== PHP_SESSION_ACTIVE || !isset($_SESSION['username'])) {
    http_response_code(401);
    echo "Unauthorized";
    exit;
  }

  // Load configuration.
  require('../../config.php');

  // Get device completion request.
  $deviceCompletionRequest = curl_init($AUTHLETE_CONFIG['DEVICE_COMPLETION_ENDPOINT']);
  curl_setopt($deviceCompletionRequest, CURLOPT_POSTFIELDS, json_encode(array(
    'userCode' => $_POST['user_code'],
    'result' => "AUTHORIZED",
    'subject' => $_SESSION['username']
  )));
  curl_setopt($deviceCompletionRequest, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json',
    'Authorization: Basic ' . base64_encode($AUTHLETE_CONFIG['API_KEY'] . ':' . $AUTHLETE_CONFIG['API_SECRET']),
  ));
  curl_setopt($deviceVerificationRequest, CURLOPT_RETURNTRANSFER, true);
  $response = json_decode(curl_exec($deviceVerificationRequest));

  if ($response->) {
    http_response_code(200);
    header("Content-Type: text/plain");
    echo "Authorization granted";
    exit;
  } else {
    http_response_code(500);
    echo "Internal server error";
  }
?>
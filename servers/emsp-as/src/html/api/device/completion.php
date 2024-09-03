<?php
  // Handles device completion request where the resource owner grants authorization.

  $start = microtime(true);

  // Check session state on validity.
  session_start();
  if (session_status() !== PHP_SESSION_ACTIVE || !isset($_SESSION['username'])) {
    http_response_code(401);
    echo "Unauthorized";
    exit;
  }

  // Load configuration.
  require('../../../config.php');

  // Get device completion request.
  $deviceCompletionRequest = curl_init($AUTHLETE_CONFIG['DEVICE_COMPLETION_ENDPOINT']);
  curl_setopt($deviceCompletionRequest, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($deviceCompletionRequest, CURLOPT_POST, true);
  curl_setopt($deviceCompletionRequest, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json',
    'Authorization: Basic ' . base64_encode($AUTHLETE_CONFIG['API_KEY'] . ':' . $AUTHLETE_CONFIG['API_SECRET']),
  ));
  curl_setopt($deviceCompletionRequest, CURLOPT_POSTFIELDS, json_encode([
    'userCode' => $_POST['user_code'],
    'result' => "AUTHORIZED",
    'subject' => $_SESSION['username'],
  ]));
  $res = curl_exec($deviceCompletionRequest);

  if ($res === false) {
    http_response_code(500);
    echo 'Error: ' . curl_error($deviceCompletionRequest);
    curl_close($deviceCompletionRequest);
    exit;
  }

  $response = json_decode($res);
  curl_close($deviceCompletionRequest);

  if ($response->action == 'SUCCESS') {
    http_response_code(200);
    header("Content-Type: text/plain");
    echo "Authorization granted";
    $end = microtime(true);
    $elapsed_time = $end - $start;
    file_put_contents('/logs/log.csv', "complete_device,$start,$end,$elapsed_time\r\n", FILE_APPEND | LOCK_EX);
    exit;
  } else {
    http_response_code(500);
    header("Content-Type: text/plain");
    echo $response->resultMessage;
    exit;
  }
?>
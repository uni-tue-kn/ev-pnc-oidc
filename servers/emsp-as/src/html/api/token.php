<?php
  // Handles Token Request.

  $start = microtime(true);

  // Load configuration.
  require('../../config.php');

  // Send Token Request.
  $tokenRequest = curl_init($AUTHLETE_CONFIG['TOKEN_ENDPOINT']);
  curl_setopt($tokenRequest, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($tokenRequest, CURLOPT_POST, true);
  curl_setopt($tokenRequest, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Basic ' . base64_encode($AUTHLETE_CONFIG['API_KEY'] . ':' . $AUTHLETE_CONFIG['API_SECRET']),
  ]);
  curl_setopt($tokenRequest, CURLOPT_POSTFIELDS, json_encode(array(
    'parameters' => http_build_query($_POST),
    'clientId' => $AUTHLETE_CONFIG['CLIENT_ID'],
    // 'clientSecret' => $AUTHLETE_CONFIG['CLIENT_SECRET'],
  )));
  $res = curl_exec($tokenRequest);

  if ($res === false) {
    http_response_code(500);
    curl_close($tokenRequest);
    exit;
  }
  $response = json_decode($res);

  // Check for success.
  if ($response->action == 'OK') {
    http_response_code(200);
    header("Content-Type: application/json");
    echo $response->responseContent;
    exit;
  } else if ($response->action == 'BAD_REQUEST') {
    http_response_code(400);
    header("Content-Type: application/json");
    echo $response->responseContent;
    $end = microtime(true);
    $elapsed_time = $end - $start;
    file_put_contents('/logs/logs.csv', "no_token,$start,$end,$elapsed_time\r\n", FILE_APPEND | LOCK_EX);
    exit;
  } else {
    http_response_code(500);
    header("Content-Type: text/plain");
    echo json_encode($response);//->resultMessage;
    $end = microtime(true);
    $elapsed_time = $end - $start;
    file_put_contents('/logs/logs.csv', "token,$start,$end,$elapsed_time\r\n", FILE_APPEND | LOCK_EX);
    exit;
  }
?>
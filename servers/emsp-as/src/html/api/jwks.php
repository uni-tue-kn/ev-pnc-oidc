<?php
  // Returns the JSON Web Key Set.
  
  // Load configuration.
  require('../../config.php');

  try {
    // Send JWK Request.
    $jwkRequest = curl_init($AUTHLETE_CONFIG['JWKS_ENDPOINT']);
    curl_setopt($jwkRequest, CURLOPT_HTTPHEADER, array(
      'Authorization: Basic ' . base64_encode($AUTHLETE_CONFIG['API_KEY'] . ':' . $AUTHLETE_CONFIG['API_SECRET']),
    ));
    curl_setopt($jwkRequest, CURLOPT_RETURNTRANSFER, true);
    $response = curl_exec($jwkRequest);

    http_response_code(200);
    header('Content-Type: application/json');
    echo $response;
  } catch (Exception $e) {
    http_response_code(500);
    print('error: ' . $e);
    echo "Internal server error";
  }
?>
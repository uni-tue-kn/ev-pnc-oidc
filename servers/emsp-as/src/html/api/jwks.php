<?php
  // Returns the JSON Web Key Set.
  
  // Load configuration.
  require('../config.php');

  // Send JWK Request.
  $jwkRequest = curl_init($AUTHLETE_CONFIG['JWKS_ENDPOINT']);
  curl_setopt($jwkRequest, CURLOPT_HTTPHEADER, array(
    'authorization: Basic ' . base64_encode($AUTHLETE_CONFIG['API_KEY'] . ':' . $AUTHLETE_CONFIG['API_SECRET']),
  ));
  curl_setopt($jwkRequest, CURLOPT_RETURNTRANSFER, true);
  $response = curl_exec($jwkRequest);

  header('content-type: application/json');
  echo $response;
?>
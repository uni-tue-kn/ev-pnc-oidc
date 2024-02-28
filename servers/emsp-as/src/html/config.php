<?php
  $authleteBase = 'https://api.authlete.com/api';

  $AUTHLETE_CONFIG = array(
    'API_KEY' => $_ENV['API_KEY'],
    'API_SECRET' => $_ENV['API_SECRET'],
    'CLIENT_ID' => $_ENV['CLIENT_ID'],
    'CLIENT_SECRET' => $_ENV['CLIENT_SECRET'],
    'PAR_ENDPOINT' => $authleteBase . '/pushed_auth_req',
    'AUTHORIZATION_ENDPOINT' => $authleteBase . '/auth/authorization',
    'AUTHORIZATION_ISSUE_ENDPOINT' => $authleteBase . '/auth/authorization/issue',
    'TOKEN_ENDPOINT' => $authleteBase . '/auth/token',
    'JWKS_ENDPOINT' => $authleteBase . '/service/jwks/get',
  );
?>

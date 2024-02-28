<?php
  // Forward to login page if not logged in.
  session_start();
  if (session_status() !== PHP_SESSION_ACTIVE) {
    http_response_code(302);
    $url = urlencode('http://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
    header('Location: http://' . $_SERVER['HTTP_HOST'] . '/login?next=' . $url);
    exit;
  }

  // Load configuration.
  require('./config.php');

  // Get authorization request.
  $authorizationRequest = curl_init($AUTHLETE_CONFIG['AUTHORIZATION_ENDPOINT']);
  curl_setopt($authorizationRequest, CURLOPT_POSTFIELDS, json_encode(array(
    'parameters' => http_build_query($_GET),
  )));
  curl_setopt($authorizationRequest, CURLOPT_HTTPHEADER, array(
    'content-type: application/json',
    'authorization: Basic ' . base64_encode($AUTHLETE_CONFIG['API_KEY'] . ':' . $AUTHLETE_CONFIG['API_SECRET']),
  ));
  curl_setopt($authorizationRequest, CURLOPT_RETURNTRANSFER, true);
  $response = json_decode(curl_exec($authorizationRequest));

  // Check for success.
  if ($response->action !== 'INTERACTION') {
    echo $response->resultMessage;
    http_response_code(500);
    exit;
  }

  // Get scopes.
  $requestObjectPayload = json_decode($response->requestObjectPayload);
  $requestedScopes = explode(' ', $requestObjectPayload->scopes);
  $supportedScopes = $response->service->supportedScopes;
  $scopes = array();
  // Go through all requested scopes.
  foreach ($requestedScopes as &$scope) {
    // Find corresponding supported scope.
    $scopeMessage = '';
    foreach ($supportedScopes as &$supportedScope) {
      if ($supportedScope->name === $scope) {
        $scopeMessage = $supportedScope->description;
        break;
      }
    }
    if ($scopeMessage === '') {
      continue;
    }

    // Add the scope item to $scopes.
    array_push($scopes, array(
      'name' => $scope,
      'description' => $scopeMessage,
    ));
  }

  // Get authorization details.
  $authorizationDetails = $response->authorizationDetails->elements;
?>
<html>
  <head>
    <title>Authorize | eMSP Authorization Server</title>
  </head>
  <body>
    <form action="/api/authorize" method="post">
      <fieldset>
        <legend>Authorize EV:</legend>
<?php foreach ($scopes as &$scope) : ?>
        <input id="scope_<?php echo $scope['name']; ?>" type="checkbox" name="scopes" required value="<?php echo $scope['name']; ?>">
        <label for="scope_<?php echo $scope['name']; ?>">
          <?php echo $scope['description']; ?>
        </label>
        <br>
<?php endforeach; ?>
        <br>
<?php foreach ($authorizationDetails as &$authorizationDetail) : ?>
        <!-- TODO: Show authorization details here -->
<?php switch ($authorizationDetail->type) : ?>
<?php case 'charging_period' : ?>
        <div>
          <strong>Charging Period:</strong>
          <br>
          <label>
            <span>Start:</span>
            <input type="text" disabled name="charging_period_start" value="<?php echo json_decode($authorizationDetail->otherFields)->start; ?>">
          </label>
          -
          <label>
            <span>End</span>
            <input type="text" disabled name="charging_period_end" value="<?php echo json_decode($authorizationDetail->otherFields)->end; ?>">
          </label>
        </div>
<?php break; ?>
<?php case 'maximum_amount' : ?>
        <div>
          <strong>Maximum Amount:</strong>
          <br>
          <label>
            <input type="number" disabled name="maximum_amount_amount" value="<?php echo json_decode($authorizationDetail->otherFields)->amount; ?>">
            <span><?php echo json_decode($authorizationDetail->otherFields)->currency; ?></span>
          </label>
        </div>
<?php break; ?>
<?php case 'maximum_transaction_amount' : ?>
        <div>
          <strong>Maximum Transaction Amount:</strong>
          <br>
          <label>
            <input type="number" disabled name="maximum_transaction_amount_amount" value="<?php echo json_decode($authorizationDetail->otherFields)->amount; ?>">
            <span><?php echo json_decode($authorizationDetail->otherFields)->currency; ?></span>
          </label>
        </div>
<?php endswitch; ?>
<?php endforeach; ?>
        <input type="hidden" name="ticket" value="<?php echo $response->ticket; ?>">
        <br>
        <input type="submit" value="Authorize">
      </fieldset>
    </form>
  </body>
</html>

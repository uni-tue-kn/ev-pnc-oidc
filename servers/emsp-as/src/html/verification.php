<?php
  // Handles device verification request.

  // Check session state on validity.
  session_start();
  if (session_status() !== PHP_SESSION_ACTIVE || !isset($_SESSION['username'])) {
    $request_url = (empty($_SERVER['HTTPS']) ? 'http' : 'https') . "://$_SERVER[HTTP_HOST]$_SERVER[REQUEST_URI]";
    // User is not logged in -> Redirect to login
    http_response_code(302);
    header('Location: /login?next=' . urlencode($request_url));
    echo "User not logged in";
    exit;
  }

  // Load configuration.
  require('../../config.php');

  // Get device veriifcation request.
  $deviceVerificationRequest = curl_init($AUTHLETE_CONFIG['DEVICE_AUTHORIZATION_ENDPOINT']);
  curl_setopt($deviceVerificationRequest, CURLOPT_POSTFIELDS, json_encode(array(
    'userCode' => $_GET['user_code'],
  )));
  curl_setopt($deviceVerificationRequest, CURLOPT_HTTPHEADER, array(
    'Content-Type: application/json',
    'Authorization: Basic ' . base64_encode($AUTHLETE_CONFIG['API_KEY'] . ':' . $AUTHLETE_CONFIG['API_SECRET']),
  ));
  curl_setopt($deviceVerificationRequest, CURLOPT_RETURNTRANSFER, true);
  $response = json_decode(curl_exec($deviceVerificationRequest));

  // Check for success.
  if ($response->action !== 'VALID') {
    echo $response->resultMessage;
    http_response_code(500);
    exit;
  }

  // Get scopes.
  $scopes = $response->scopes;

  // Get authorization details.
  $authorizationDetails = $response->authorizationDetails->elements;
?>
<html>
  <head>
    <title>Authorize | eMSP Authorization Server</title>
  </head>
  <body>
    <form action="/api/device/completion" method="post">
      <fieldset>
        <legend>Authorize EV:</legend>
<?php foreach ($scopes as &$scope) : ?>
        <input id="scope_<?php echo $scope->name; ?>" type="checkbox" name="scopes" required value="<?php echo $scope->name; ?>">
        <label for="scope_<?php echo $scope->name; ?>">
          <?php echo $scope->description; ?>
        </label>
        <br>
<?php endforeach; ?>
        <br>
<?php foreach ($authorizationDetails as &$authorizationDetail) : ?>
<?php switch ($authorizationDetail->type) : ?>
<?php case 'pnc_contract_request' : ?>
        <div>
          <div>
            <strong>Charging Period:</strong>
            <br>
            <label>
              <span>Start:</span>
              <input type="text" disabled name="charging_period_start" value="<?php echo json_decode($authorizationDetail->otherFields)->charging_period->start; ?>">
            </label>
            -
            <label>
              <span>End</span>
              <input type="text" disabled name="charging_period_end" value="<?php echo json_decode($authorizationDetail->otherFields)->charging_period->end; ?>">
            </label>
          </div>
          <div>
            <strong>Maximum Amount:</strong>
            <br>
            <label>
              <input type="number" disabled name="maximum_amount_amount" value="<?php echo json_decode($authorizationDetail->otherFields)->maximum_amount->amount; ?>">
              <span><?php echo json_decode($authorizationDetail->otherFields)->maximum_amount->currency; ?></span>
            </label>
          </div>
          <div>
            <strong>Maximum Transaction Amount:</strong>
            <br>
            <label>
              <input type="number" disabled name="maximum_transaction_amount_amount" value="<?php echo json_decode($authorizationDetail->otherFields)->maximum_transaction_amount->amount; ?>">
              <span><?php echo json_decode($authorizationDetail->otherFields)->maximum_transaction_amount->currency; ?></span>
            </label>
          </div>
        </div>
<?php break; ?>
<?php endswitch; ?>
<?php endforeach; ?>
        <label>
          <span>User Code:</span>
          <input type="text" id="user_code" name="user_code" value="<?php echo $_GET['user_code']; ?>">
        </label>
        <br>
        <input type="submit" value="Authorize">
      </fieldset>
    </form>
  </body>
</html>

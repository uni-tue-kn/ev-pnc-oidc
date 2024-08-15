<?php
  // Handles Login Submission

  // Validate credentials.
  if ($_POST['username'] !== 'john' || $_POST['password'] !== 'smith') {
    http_response_code(401);
    echo 'Invalid usrname or password!'
    exit;
  }

  // Start session.
  session_start([
    'cookie_lifetime' => 3600,
  ]);
  $_SESSION['username'] = $_POST['username'];
  echo "Successfully logged in as " . $_SESSION['username'] . "."

  // Redirect if next parameter is set.
  if (isset($_POST['next'])) {
    http_response_code(302);
    header("Location: " . $_POST['next']);
    echo "\r\nRedirecting to " . $_POST['next'] . "...";
    exit;
  } else {
    http_response_code(200);
    exit;
  }
?>

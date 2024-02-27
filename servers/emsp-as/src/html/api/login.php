<?php
  // Handles Login Submission

  // Validate credentials.
  if ($_POST['username'] !== 'john' || $_POST['password'] !== 'smith') {
    http_response_code(401);
    exit;
  } else {
    // Start session.
    session_start([
      // 'cookie_lifetime' => 3600,
    ]);
    $_SESSION['username'] = $_POST['username'];
  }

  // Redirect if next parameter is set.
  if (isset($_POST['next'])) {
    http_response_code(302);
    header("Location: " . $_POST['next']);
    exit;
  }

  http_response_code(200);
?>
Successfully logged in as "<?php echo $_POST['username']; ?>".

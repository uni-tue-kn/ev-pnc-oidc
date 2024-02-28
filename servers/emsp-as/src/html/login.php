<html>
  <head>
    <title>Login | eMSP Authorization Server</title>
  </head>
  <body>
    <form action="/api/login" method="post">
      <fieldset>
        <legend>eMSP Login:</legend>
<?php if (isset($_GET['next'])): ?>
        <input type="hidden" name="next" value="<?php echo $_GET['next']; ?>">
<?php endif; ?>
        <label for="username">Username:</label>
        <br>
        <input id="username" type="text" name="username" required autocomplete="on">
        <br>
        <label for="password">Password:</label>
        <br>
        <input id="password" type="password" name="password" required autocomplete="off">
        <br>
        <input type="submit" value="Login">
      </fieldset>
    </form>
  </body>
</html>

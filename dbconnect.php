<?php
//connect mysql database
$host = "localhost";
$user = "blakehenderson";
$pass = "password";
$db = "ams";
$con = mysqli_connect($host, $user, $pass, $db) or die("Error " . mysqli_error($con));
?>
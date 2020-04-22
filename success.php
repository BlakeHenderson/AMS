<?php
include('database_connection.php');


if($_GET['st']=="Completed"){
 $item_transaction = $_GET['tx'];
 $item_price = $_GET['amt']; 
 $item_currency = $_GET['cc'];
 $item_no = $_GET['item_number'];
 
 $query = "insert into payment_transaction values('',".$item_transaction.",".$item_price.",".$item_currency.",".$item_no.")";
 $statement = $connect->prepare($query);
 $statement->execute();
 
 if($statement->execute($data))
 {
   echo "Payment Done Successfully";
 }
}

?>
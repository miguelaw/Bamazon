
//Required modules
var mysql = require("mysql2");
var inquirer = require("inquirer");

// connection information for the sql database
var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,

    // Username, password & database info
    user: "root",
    password: "1234",
    database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function(err) {
    if (err) throw err;
    // run the customer function after the connection is made to prompt the user
    displayData()
});

// Function displays data from database and runs Customer prompt function
function displayData() {
    console.log("Welcome to my store!");

    let query = "SELECT * FROM products;";
    connection.query(query, function(err, res) {
        if (err) {
            console.log("Error: " + err);
        } else {
            for (var i = 0; i < res.length; i++) {
                console.log("ITEM ID: " + res[i].item_id + " || PRODUCT: " + res[i].product_name + " || PRICE: " + res[i].price + "\n");
            }
        }
        customer();

    });

}

// Function that prompts the user, processes the order and updates inventory or cancels order if not enough stock
function customer() {

    inquirer
        .prompt([{
                name: "item_id",
                message: "What is the ID of the product you want to buy?",
            },
            {
                name: "quantity",
                message: "How many units of the product you want to buy?",
            }
        ])
        .then(function(answer) {
            connection.query("SELECT * FROM products WHERE ?", {
                item_id: answer.item_id
            }, function(err, res) {

                if (err) {
                    console.log("Error: " + err);
                } else {

                    for (var i = 0; i < res.length; i++) {

                        if (answer.quantity > res[i].stock_quantity) {

                            console.log("Oh no! Insufficient Stock");
                            connection.end();
                        } else {
                            console.log("Your Total is: " + (answer.quantity * res[i].price))
                            console.log("Success!, Order was completed");

                            let newStock = `UPDATE products
                              SET stock_quantity = ?
                              WHERE item_id = ?`;

                            let data = [+res[i].stock_quantity - +answer.quantity, answer.item_id];

                            connection.query(newStock, data, (error, results) => {
                                if (error) {
                                    console.error("Error processing stock: " + error);
                                }
                                console.log('(Stock Quantities have been updated)');
                                connection.end();
                            });
                        }
                    }
                }
            });
        });
}
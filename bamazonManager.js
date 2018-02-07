//Required modules
var mysql = require("mysql2");
var inquirer = require("inquirer");

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
    // run the menuOptions function after the connection is made to prompt the user
    menuOptions()
});

// Function that provides the manager with a menu that lets him/her: View Products for Sale, View Low Inventory, Add to Inventory, and Add New Products.
function menuOptions() {
    console.log("\\ Welcome Manager //");

    inquirer
        .prompt({
            name: "menu",
            type: "list",
            message: "What do you want to do?",
            choices: ["View Products for Sale", "View Low Inventory", "Add to Inventory", "Add New Products"]
        })
        .then(function(answer) {

            if (answer.menu === "View Products for Sale") {

                let query = "SELECT * FROM products;";
                connection.query(query, function(err, res) {
                    if (err) {
                        console.log("Error: " + err);
                    } else {

                        for (var i = 0; i < res.length; i++) {

                            console.log("ITEM ID: " + res[i].item_id + " |-| PRODUCT: " + res[i].product_name + "\n |-| PRICE: " + res[i].price + " |-| QUANTITIES: " + res[i].stock_quantity + "\n");

                        }
                    }

                });
                connection.end();

            } else if (answer.menu === "View Low Inventory") {

                let query = "SELECT item_id, product_name, price, stock_quantity FROM products WHERE stock_quantity < 5";
                connection.query(query, function(err, res) {
                    if (err) {
                        console.log("Error: " + err);
                    } else {

                        for (var i = 0; i < res.length; i++) {

                            console.log("ITEM ID: " + res[i].item_id + " |-| PRODUCT: " + res[i].product_name + "\n |-| PRICE: " + res[i].price + " |-| QUANTITIES: " + res[i].stock_quantity+ "\n");

                        }
                    }

                });
                connection.end();

            } else if (answer.menu === "Add to Inventory") {

                inquirer
                    .prompt([{
                            name: "item_id",
                            message: "What is the ID of the product you want to add?",
                        },
                        {
                            name: "quantity",
                            message: "How many units of the product you want to add?",
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

                                    if (res[i].stock_quantity > 9) {

                                        console.log("Inventory is full for this item");
                                        connection.end();

                                    } else {
                                        let newStock = `UPDATE products
                                        SET stock_quantity = ?
                                        WHERE item_id = ?`;

                                        let data = [+res[i].stock_quantity + +answer.quantity, answer.item_id];

                                        connection.query(newStock, data, (error, res) => {
                                            if (error) {
                                                console.error("Error processing stock: " + error);
                                            } else {
                                                console.log('(Stock Quantities have been updated)');
                                                connection.end();
                                            }

                                        });
                                    }
                                }
                            }
                        })
                    })

            } else if (answer.menu === "Add New Products") {

                inquirer
                    .prompt([{
                            name: "item_id",
                            message: "What is the ID of the product you want to add?",
                        },
                        {
                            name: "name",
                            message: "What is the name of the product you want to add?",
                        },
                        {
                            name: "department",
                            message: "What is the department of the product you want to add?",
                        },
                        {
                            name: "price",
                            message: "How much is the product you want to add?",
                        },
                        {
                            name: "quantity",
                            message: "How many units of the product you want to add?",
                        }
                    ])
                    .then(function(answer) {

                        connection.query("SELECT * FROM products",

                            function(err, res) {

                                if (err) {
                                    console.log("Error: " + err);
                                } else {

                                    let newItem = `INSERT INTO products VALUES (?, ?, ?, ?, ?)`;

                                    let itemData = [answer.item_id, answer.name, answer.department, answer.price, answer.quantity];

                                    connection.query(newItem, itemData, (error, res) => {
                                        if (error) {
                                            console.error("Error processing new item: " + error);
                                        } else {
                                            console.log('(Item list has been updated)');
                                            connection.end();
                                        }
                                    });
                                }
                            })
                    })
            }
        })
}
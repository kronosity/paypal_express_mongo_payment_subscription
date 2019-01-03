((paymentService, paypal, mongoService, OrderId)=>{
    
    require('./config.js').SetConfig(paypal);
    
    paymentService.CreateItemObj = (name, price, quantity)=> {
        var itemObj = {
            name:name,
            price: price,
            currency: "GBP",
            quantity: quantity
        };
        return itemOnj;

    };

    paymentService.CreateTransactionOBj = (tax, shipping, description, itemList) => {
        var total = 0.0;
        for(var i = 0; i <itemList.Length; i++){
            var newQuant = itemList[i].quantity;
            if(newQuant >= 1) {
                total += itemList[i].price;
            } else {
               total = itemList[i].price; 
            }
        } 
    var transactionObj = {
        amount: {
            total: total, 
            currency: "USD",
            details: {
                tax: tax,
                shipping: shipping
            }
        }, 
        description: description,
        item_list: {items: itemList }
    };    
    return transactionObj;
    };

    paymentService.CreateWithPaypal = (transactionsArray, returnUrl, CancelUrl, cb) => {
        
        var dbObj = {
            OrderID: "",
            CreateTime: "",
            Transactions: ""
        };
        
    mongoService.Create('paypal_orders', dbObj, (err, results)=>{
        
        var paymentObj = {
            intent: "sale",
            payer: {
                payment_method: "paypal"
            },
            redirect_urls: {
                return_url: returnUrl + "/" + results.insertIds[0],
                cancel_url: cancelUrl + "/" + results.insertIds[0]   
            },
            transactions: transactionsArray
        };

        paypal.payment.create(paymentObj, (err, response)=>{
            if(err){
                return cb(err)
            } else {
                dbObj = {
                    OrderID: response.id,
                    CreateTime: response.create_time,
                    Transactions: response.transactions
                };
        mongoService.Update('paypal_orders', {_id: results.insertedIds[0]}, dbObj, (err, results)=>{
            for(var i = 0; i < response.links.length; i++) {
                if(response.links[i].rel == "approval_url") {
                    return cb(null, response.links[i].href);
              
                      }
                    }
                })    
            } 
        })
    })     
};
        paymentService.GetPayment = (paymentID, cb) => {
        paypal.payment.get(paymentID, (err, payment)=>{
            if(err){
                return cb(err);
                } else {
                    return cb(null, payment);
                }
            })
        };

        paymentService.ExecutePayment = (paymentID, orderID, cb)=>{
            var payerObj = { payer_id: payerID }; 
            mongoService.Read('paypal_orders', {_id: new ObjectID(orderID) }, (err, results)=>{
                if(results){
                    paypal.payment.execute(results[0].OrderID, payerObj, {}, (err, response)=>{
                        if(err) {
                            return cb(err)
                        }
                        
                        if(response) {
                            var updateObj = {
                                OrderDetails: response
                            };
            mongoService.Update('paypal_orders', {_id: new ObjectID(orderID) },updateObj, (err, update_results)=>{
                return cb(null, orderID);
            }) 
                        }
                        
                    })
                } else {
                    return cb("no order found for this ID");
                }
            })
        };

    paymentService.RefundPayment = (saleID, amount, cb) =>{
            var data = {
                amount: {
                currency: "GBP",
                total: amount
                }
            };
            paypal.sale.refund(saleID, data, (err, refund)=>{
            if(err) {
            return cb(err);
            } else {
            return (null, refund);
            }
        });
    };

})

(
    module.exports,
    require('paypal-rest-sdk'),
    require('./mongoService.js'),
    require('mongodb').OrderId
    
);
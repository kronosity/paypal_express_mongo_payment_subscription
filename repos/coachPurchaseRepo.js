((coachPurchaseRepo, paypal, ObjectID, mongoService, paymentService, subService ) => {

    coachPurchaseRepo.BuySingle = (
        purchaseName, purchasePrice, taxPrice, shippingPrice, itemCount, description, cb) => {
            var transactionsArray = [];
            for(var i=0; i < itemCount; i++) {
                var itemObj = paymentService.CreateItemObj(purchaseName, purchaseprice, 1);
                transactionsArray.push(itemObj);            
            }

            var transanctionItemObj = [paymentService.CreatTransactionObj (
                    taxPrice, shippingPrice, description, transactionArray
            )];

            paymentService.CreateWithPaypal(transactionItemObj, 
                "http://localhost8080/success",
                "http://localhost:8080/cancel", (err, results)=>{
                   if(err){
                       return cb(err)
                   } else {
                       return cb(null, results);
                   }
                });
            };

            coachPurchaseRepo.ExecuteOrder = (payerID, orderID, cb)=>{
                paymentService.ExecutePayment(payerID, orderID, (err, response)=>{
                    return cb(err, response);
                });
            };

            coachPurchaseRepo.CancelOrder = (orderID, cb) => {
                mongoService.Delete("paypal_orders", {_id: new ObjectID(orderID) }, (err, results)=>{
                    return cb(err, results);
                })
            };

            coachPurchaseRepo.GetOrder = (orderID, cb) => {
                mongoService.Read("paypal_orders", {_id: new ObjectID(orderID)}, (order_err, paymentObj)=>{
                    if(order_err) {
                        return cb(order_err);
                    } else {
                        paymentService.GetPayment(paymentObj[0].OrderDetails.id, (err, results) =>{
                            return cb(err, results);
                        });
                    }
                });
            };

            coachPurchaseRepo.RefundOrder = (OrderID, cb) =>{
              coachPurchaseRepo.GetOrder(orderID, (order_err, order) => {
                if(order_err) {
                    return cb(order_err)
                }
                var saleID = order.transactions[0].related_resources[0].sale.id;
                var refundPrice = Number(order.transaction[0].amount.total);
               
                paymentService.RefundPayment(saleID, refundPrice, (err, refund) => {
                    cb(err, refund);
                });

              });  
            } 
            
            coachPurchaseRepo.BuyRecurring = (planName, description, setUpFee, cb) => {
                var planObj = {
                    PlanID: ""
                };
            }
            mongoService.Create('paypal_plans', planObj, (err, results)=>{
                var returnUrl = "http://localhost:8080/recurring_success/" + results.insertedIds[0];
                var cancelUrl = "http://localhost:8080/recurring cancel/" + resultsIds[0];
            
                var chargeModels = [
                    subService.CreateChargeModelObj(0, "TAX"),
                    subService.CreateChargeModelObj(0, "SHIPPING")
                ]

                var paymentDefintionsArray = [
                    subService.CreatePaymentDefintionsObj("Trading Coaching", 49.99, "REGULAR", chargeModels, 12, "MONTH", 1)
                ];

                var billingPlanAttributes = subService.CreateBillingPlanAttributesObj(planName, description, "YES", 
                cancelUrl, returnUrl, "fixed", 0, paymentDefinitionsArray );

                subService.CreatePlan(billingPlanAttributes, (err, newPlan) => {
                    mongoService.Update('paypal_plans', {_id: results.insertedIds[0]}, {PlanID: newPlan.id}, (err, results)=>{
                        subService.UpdatePlanState(newPlan.id, "ACTIVE", (err, u_results)=>{
                            var shippingObj = subService.CreatBillingShippingObj(
                                "Address line 1", "", "Address City", "Address State", "Postal Code", "Country"
                            );
                                var agreementObj = subService.CreateBillingAgreementAttributesObj(
                                    "Maintained Agreement",
                                    "Maintained Description",
                                    new Date(Date.now() + (5000 * 50)),
                                    newPlan.id, 
                                    "PAYPAL",
                                    shippingObj
                                );

                               subService.CreateAgreement(agreementObj, (err, response)=>{
                                    for(var i = 0; i <response.links.length; i++) {
                                        if(response.links[i].rel == "approval_url") {
                                            return cb(err, response.links[i].href);

                                        }
                                    }
                               })     

                        })
                    })
                });    
            });

            coachPurchaseRepo.ExecuteRecurring = (token, cb) => {
                subService.ExecuteAgreement(token, (err, results)=>{
                    return cb(err,results);
                }); 
            };

            coachPurchaseRepo.GetRecurringDetails = (agreementID, cb) =>{
                subService.GetAgreement(agreementID, (err, results)=>{
                    return cb(err, results);
                });
            };    


})
(
    module.exports,
    require('paypal-rest-sdk'),
    require('mongodb').ObjectId,
    require('../services/mongoService.js'),
    require('../services/paymentService.js'),
    require('../services/subscriptionService.js')
);
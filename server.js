((express, server, bodyParser, fs, coachPurchaseRepo) => {
    
    server.use(bodyParser.urlencoded({ extended: true }));
    server.use(express.static("pub"));
    
    server.get('/', (req, res)=>{
        fs.readFile("./templates/home.html", (err, results)=>{
            res.send(results.toString());
        });
    });

    server.get('/success/:orderID', (req, res)=>{
        var orderID = req.params.orderID;
        var payerID = req.query.PayerID;
        coachPurchaseRepo(payerID, orderID, (err, successID)=>{
          if(err){
            res.send("<h1>There was an error in processing the transaction was not complete. Please retry.</h1>");
          } else {
            res.send("<h1>Your Order for Trading Coaching has been placed</h1>Please save your order confirmation number:" + 
              successID);
          }  
        })
    });
    
    server.get('/cancel/:orderID', (req, res)=>{
        var orderID = req.params.orderID;
        coachPurchaseRepo.CancelOrder(orderID, (err, results) => {
            if(err) {
                res.send("There was an error removing this order");
            } else {
                res.redirect('/');            }
        })
    });
    
    server.get('/orderdetails/:orderID', (req, res)=>{
        var orderID = req.params.orderID;
        coachPurchaseRepo.getOrder(orderID, (err, results)=>{
            if(err) {
                res.json(err)
            } else {
                res.json(results);
            }
        });
    });

    server.get('/refund/:orderID', (req, res)=>{
        var orderID = req.params.orderID;
        coachPurchaseRepo.RefundOrder(orderID, (err, refund)=>{
            if(err){
                res.json(err);
            } else {
                res.json(refund);
            }
        });
    });

    server.get('/recurring_success/:planID', (req, res)=>{
        var planID = req.params.planID;
        var token = req.query.token;
        coachPurchaseRepo.ExecuteRecurring(planID, token, (err, results)=>{
            if(err){
                res.json(err); // **dev only**
            } else {
                res.json(results);
            }
        })
    });
    
    
    server.get('/recurring_cancel/:planID', (req, res)=>{
        var planID = req.params.planID;
    });
    
    
    server.get('/recurring_orderdetails/:agreementID', (req, res)=>{
        var agreementID = req.params.agreementID;
        coachPurchaseRepo.GetRecurringDetails(agreementID, (err, recurring_orderdetails)=>{
            if(err){
                res.json(err) //**dev only */
            }else {
                res.json(recurring_orderdetails);
            }
        });
    });
    
server.post('/buysingle', (req, res)=>{
        var quantity = req.body.Quantity;
        var purchaseName ="Trading Coaching Sessions";
        var purchasePrice = 10.00;
        var taxPrice = 0;
        var shippingPrice = 0;
        var description = `Independent Trading coaching, 
        Technical analysis, Fundamental analysis, senitmental analysis, signals 
        and ongoing support`;
    });
    
coachPurchaseRepo.BuySingle(
    purchaseName, purchasePrice, taxPrice, shippingPrice, quantity, description, (err, url)=>{
        if(err){
            return 'An error has occured, please resubmit and try again'
        } else {
            res.redirect(url);

        }
    });

    
    server.get('/buyrecurring', (req, res)=>{
        coachPurchaseRepo.BuyRecurring(  
            "Trading coaching plan", 
            "Recurring monthly fee for on going trading coaching",
            0, 
            (err, plan)=>{
                if(err){
                    res.json //***dev only***
                } else {
                    res.redirect(plan);
                }
            }
        );
      
    });
    
    server.listen(8080, "localhost", (err)=> {
        console.log(err || "server online");

    });
})

(
require('express'),
require('express')(),
require('body-parser'),
require('fs'),
require('./repos/coachPurchaseRepo.js')
);
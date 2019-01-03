((subService, paypal, mongoService) => {
  
subService.CreateBillingPlanAttributesObj = ( 
    planName, description, autobill, cancelUrl, returnUrl, planType, setUpFee, paymentDefinitionsArray ) => {
        var biillingPlanAttributes = {
            name: planName,
            description: description,
            type: planType,
            merchant_preferences: {
                auto_bill_amount: autobill,
                cancel_url: cancelUrl,
                return_url: returnUrl,
                initial_fail_amount_action: "CONTINUE",
                max_fail_attempts: "1",
                setup_fee: {
                    currency: "USD",
                    value: setUpFee
                }
            },
            payment_definitions: paymentDefinitionsArray
        };
        return biillingPlanAttributes;
  };
  
  subService.CreatChargeModelObj = (amount, type) => {
    var chargeModelObj = {
        amount: {
            currency: "GBP",
            value: amount
        },
        type: type
    };
    return chargeModelObj;
}
subService.CreatePaymentDefinitionsObj = (name, price, type, chargeModels, cycles, frequency, interval) => {
        for(var i = 0; i <chargeModels.length; i++){
            price += chargeModels[i].amount.value;
        }
        var paymentDefinitionsObj = {
            amount: {
                currency: "USD",
                value: price
            },
            charge_models: chargeModels,
            cycles: cycles,
            frequency: frequency,
            frequency_intreval: interval,
            name: name,
            type: type
        };
        return paymentDefinitionsObj;
};

subService.CreateBillingShippingObj = (addrOne, addrTwo, city, state, postal, countryCode) => {
    var billingObj = {
        line1: addrOne,
        line2: addrTwo,
        city: city,
        state: state,
        postal_code: postal,
        country_code: countryCode
    };

    return billingObj;
};

subService.CreateBillingAgreementAttributesObj = (name, description, startDate, planID, paymentMethod, shippingObj) => {
    var billingAgreementAttributes = {
        name:name,
        description: description,
        start_date: startDate,
        plan: {
            id: planID
        },
        payer: {
            payment_method: paymentMethod
        },
        shipping_address: shippingObj
    };

    return billingPlanAttributes;
};

subService.CreateAgreementUpdateAttributesObj = (name, description, shippingObj) => {
    var updateAttributeObj = {
        op: "replace",
        path: "/",
        value: {
            description: description,
            name: name,
            shipping_address: shippingObj
        }
    };
    return updateAttributeObj;
};

subService.CreatePlan = (billingPlanAttributes, cb) => {
    paypal.billingPlan.create(billingPlanAttributes, (err, billingPlan)=>{
        return cb(err, billingPlan);
    })
};

subService.GetPlan = (billingPlanID, cb) => {
    paypal.billingPlan.get(billingPlanID, (err, billingPlan) => {})
    return cb(err, billingPlan);
};

subService.UpdatePlanState = (billingPlanID, status, cb) => {
    var billing_plan_update_attributes = [{
        op:"replace",
        path: "/",
        value: {state: status}
    }];
paypal.billingPlan.update(billingPlanID, billing_plan_update_attributes, (err, response)=>{
    return cb(err, response);
});
};

subService.CreateAgreement = (billingAgreementAttributes, cb) => {
    paypal.billingAgreement.create(billingAgreementAttributes, (err, billingAgreementAttributes)=>{
        return cb(err, billingAgreement);
    });
}

subService.CancelAgreement = (billingAgreementID, cancelNote, cb) => {
    var cancel_note = {
        note: cancelNote
    };
    paypal.billingAgreement.cancel(billingAgreemenID, cancel_note, (err, response)=>{
        return cb(err, response);
    });
}

subService.GetAgreement = (agreementID, cb) => {
    paypal.billingAgreement.get(agreementID, (err, billingAgreement) => {
        return cb(err, billingAgreement);
    });
};

subService.ExecuteAgreement = (paymentToken, cb) => {
    paypal.billingAgreement.execute(paymentToken, {}, (err, billingAgreement)=>{
        return cb(err, billingAgreement);
    });
};

subService.UpdateAgreement = (billingAgreementID, billing_agreement_update_attributes, cb) => {
    paypal.billingAgreement.update(billingAgreementID, billing_agreement_update_attributes, (err, response)=>{
        return cb(err, response);
    });
};

})
(
    module.exports,
    require('paypal-rest.sdk'),
    require('./mongoService.js')
    
);
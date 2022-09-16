//show div

 $(document).ready(function(){
  $("#displaycoupons").click(function(){
 
      $("#showcoupons").toggle();
  });
});

  function  displaycheckout(){

    let list1=   document.getElementById("checkout-button").classList
    let list2 = document.getElementById("paypal-button-container").classList;
    list1.add('disbtn')
    list2.remove('disbtn')
     }
   
     function  displaypaypal(){
   let list1=   document.getElementById("checkout-button").classList
   let list2 = document.getElementById("paypal-button-container").classList;
   list1.remove('disbtn')
   list2.add('disbtn')
   
   }
   
     $("#checkout-form").submit((e) => {
       e.preventDefault();
       $.ajax({
         url: "/place-order",
         method: "post",
         data: $("#checkout-form").serialize(),
         success: (res) => {
           if (res.codSuccess) {
             location.href = "/orderplaced";
           } else {
             razorpayPayment(res);
           }
         },
       });
     });
   
   
     $("#checkout-saveaddress-form").submit((e) => {
       e.preventDefault();
       $.ajax({
         url: "/place-order",
         method: "post",
         data: $("#checkout-saveaddress-form").serialize(),
         success: (res) => {
           if (res.codSuccess) {
             console.log(res.codSuccess);
             location.href = "/orderplaced";
           }else if(res.paypalSuccess) {
             console.log(res.paypalSuccess,'transaction completed successfully using paypal');
             location.href = "/orderplaced";
           } else {
             razorpayPayment(res);
           }
         },
       });
     });
     
     function razorpayPayment(order) {
       var options = {
   "key": "rzp_test_hoOZcN9A4HjtUu", // Enter the Key ID generated from the Dashboard
   "amount": order.amount , // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
   "currency": "INR",
   "name": "Menz shop",
   "description": "Test Transaction",
   "image": "https://example.com/your_logo",
   "order_id": order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
   "handler": function (response){
       verifyPayment(response,order);
   },
   "prefill": {
       "name": "Gaurav Kumar",
       "email": "gaurav.kumar@example.com",
       "contact": "9999999999"
   },
   "notes": {
       "address": "Razorpay Corporate Office"
   },
   "theme": {
       "color": "#3399cc"
   }
   }; 
   var rzp1 = new Razorpay(options);
   rzp1.open();
     }
   
     function verifyPayment(payment,order){
      console.log(payment)
       $.ajax({
         url:'/verifypayment',
         data:{
           payment,
           order
          
         },
         method:'post',
         success:(response=>{
           if(response.status){
             location.href = "/orderplaced";
           }else{
             alert('payment failed')
           }
         })
   
       })
     }
   
   
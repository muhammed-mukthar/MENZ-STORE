function deletewishlist(wishlistId,product_Id){
    $.ajax({
			url:'/wishlist/delete',
			data:{
            wishlist: wishlistId,
            productId:product_Id
			},
			method: 'post',
			success:(res)=>{
          location.reload()	
			}
            
        })



  }





     function  deleteproduct(wishlistId, proId, userId){
				Swal.fire({
            title: 'Are you want to Remove?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Remove'
        }).then((result) => {
          if(result.isConfirmed){
            $.ajax({
			url:'/wishlist/remove',
			data:{
				user: userId,
            wishlist: wishlistId,
            product: proId,
         
			},
			method: 'post',
			success:(res)=>{
          location.reload()	
			}
            
        })



          }
           
		
    
				
				

			})
		}

		


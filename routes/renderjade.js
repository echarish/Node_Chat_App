modules.export={

    homelayout:function(request, response){
             response.render('homeLayout', { loginUserName: req.query.userName });
        } ,

    loginpage:function(request, response){
               response.render('login',  { title: 'AXA Communicate' });
       } ,

    index :function(request, response){
                   response.render('login',  { title: 'AXA Communicate' });
           } ,

};
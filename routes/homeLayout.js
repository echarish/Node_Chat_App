
/*
 * GET home page.
 */

exports.homeLayout = function(req, res){
  res.render('homeLayout', { loginUserName: req.query.userName });
};
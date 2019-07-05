/*$(document).ready(function() {
  jq = $.noConflict(true);
  du_checkParentSize();
  
  
}); 

$(window).resize(function() {
  du_checkParentSize();
}); 

var du_checkParentSize = function(){
  var b = jq("#wrapper");

  if (b.parent().width() > 650) {
      b.removeClass("du-mobile");
  } else {
      b.addClass("du-mobile");

  }
};*/
start();

function start(){
  intializeLanding();
}
$(document).ready(function(){
  $("#search").submit(function(event){
    var url = "/api?topic="+encodeURI($("#topic").val())+"&count="+$("#count").val();
    $('#htopic').html($("#topic").val());
    $('#hstatus').html("Processing...");
    $('#hrating').html("");
    $('#stars').html("");
    $.get(url, function(data){
      var rating = data.percentage_score.toFixed(1);
      var html = "";
      var full_star = "<i class='fa fa-star'></i>";
      var half_star = "<i class='fa fa-star-half-o'></i>";
      var empty_star = "<i class='fa fa-star-o'></i>";

      var t = rating*10/2;
      for(var i = 0; i < 5; i++) {
        if(t >= 10){
          html += full_star;
        } else {
          if(t>5) {
            html += half_star;
          }else{
            html += empty_star;
          }
        }
        t -= 10;
      }
      $("#hstatus").html("");
      $("#stars").html(html);
      $("#hrating").html("Rating "+rating+"/10");
    });
    return false;
  });
});

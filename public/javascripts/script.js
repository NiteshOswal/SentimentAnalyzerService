/**
 * Object.values polyfill
 */
const reduce = Function.bind.call(Function.call, Array.prototype.reduce);
const isEnumerable = Function.bind.call(Function.call, Object.prototype.propertyIsEnumerable);
const concat = Function.bind.call(Function.call, Array.prototype.concat);
const keys = Reflect.ownKeys;

if (!Object.values) {
  Object.values = function values(O) {
    return reduce(keys(O), (v, k) => concat(v, typeof k === 'string' && isEnumerable(O, k) ? [O[k]] : []), []);
  };
}

$(document).ready(function(){
  $("#search").submit(function(event) {
    $('#details').show();
    var url = "/api?topic="+encodeURI($("#topic").val())+"&count="+$("#count").val();
    $('#htopic').html($("#topic").val());
    $('#hstatus').html("Processing...");
    $('#hrating').html("");
    $(".help-block").html("");
    $('#stars').html("");
    $.get(url, function(data){
      var rating = data.total_score.toFixed(1),
        html = "",
        full_star = "<i class='fa fa-star'></i>",
        half_star = "<i class='fa fa-star-half-o'></i>",
        empty_star = "<i class='fa fa-star-o'></i>";

      var stats = new Chart($('#stats'), {
          type: 'bar',
          data: {
              labels: Object.keys(data.score_by_date),
              datasets: [
                {
                  label: "Score",
                  data: Object.values(data.score_by_date).map(function(v) { return v.total_score; })
                }
              ]
          }
      });

      var t = rating*10/2;
      for(var i = 0; i < 5; i++) {
        if(t >= 10) {
          html += full_star;
        } else {
          if(t > 5) {
            html += half_star;
          } else {
            html += empty_star;
          }
        }
        t -= 10;
      }
      $("#hstatus").html("");
      $("#stars").html(html);
      $("#hrating").html("Rating "+rating+"/10");
      $(".help-block").html('<a href="/' + data.slug + '" target="_blank">API Endpoint for periodic updates of data</a>');
    });
    return false;
  });
});

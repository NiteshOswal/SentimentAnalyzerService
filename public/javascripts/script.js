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

function calRating(id="", isChart=false){
  $('#details'+id).show();
  $('#htopic'+id).html($("#topic"+id).val());
  $('#hstatus'+id).html("Processing...");
  $('#hrating'+id).html("");
  $(".help-block").html("");
  $('#stars'+id).html("");
  var topic = $("#topic"+id).val(),
      url = "/api?topic=" + encodeURI(topic) + "&count=" + $("#count").val(),
      wiki_url = "https://en.wikipedia.org/w/api.php?format=json&action=query&generator=search&gsrnamespace=0&gsrlimit=1&prop=pageimages|extracts&pilimit=max&exintro&explaintext&exsentences=1&exlimit=max&gsrsearch="+topic.replace(/ /g,"+")

  $.ajax({
    url: wiki_url,
    dataType: "jsonp",
    success: function(data){
      var temp;
      if(data){
        wiki = data.query.pages;
        $.each(wiki, function(w, d){
          temp = d;
        });
        $("#extract"+id).html(temp.extract);
        $("#thumb"+id).attr("src",temp.thumbnail.source)
      }
    }
  });

  $.get(url, function(data) {
      if (!data.status) {
          $("#hstatus"+id).html("Hmm, something bad happened here");
          return;
      }
      var rating = data.total_score.toFixed(1),
          html = "",
          full_star = "<i class='fa fa-star'></i>",
          half_star = "<i class='fa fa-star-half-o'></i>",
          empty_star = "<i class='fa fa-star-o'></i>";

      if(isChart){
        var stats = new Chart($('#stats'), {
            type: 'bar',
            data: {
                labels: Object.keys(data.score_by_date),
                datasets: [{
                    label: "Score",
                    data: Object.values(data.score_by_date).map(function(v) {
                        return v.total_score;
                    })
                }]
            }
        });
      }

      var t = rating * 10 / 2;
      for (var i = 0; i < 5; i++) {
          if (t >= 10) {
              html += full_star;
          } else {
              if (t > 5) {
                  html += half_star;
              } else {
                  html += empty_star;
              }
          }
          t -= 10;
      }
      $("#hstatus"+id).html("");
      $("#stars"+id).html(html);
      $("#hrating"+id).html("Rating " + rating + "/10");
      $(".help-block").html('<a href="/' + data.slug + '" target="_blank">API Endpoint for periodic updates of data</a>');
  });
}

$(document).ready(function() {

    $("#compareBtn").on('click', function() {
        calRating(1);
        calRating(2);
    });

    $("#search").submit(function(event) {
        calRating('',true)
        return false;
    });

    $(".btn-flush").on('click', function() {
        var self = this;
        $.get('/flush?name=' + self.dataset.file, function(data) {
            if(data.status) {
                if(self.dataset.trigger)
                    $(self.dataset.trigger).remove();
            }
        })
    });
});

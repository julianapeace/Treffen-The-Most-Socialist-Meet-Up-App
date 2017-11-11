$("#submit").click(function() {
  $.ajax({
    method: "GET",
    url: "http://45.55.198.11:7777/nearest",
    data: {"zip_codes": $("#zipInput").val()},
    success: function(data) {
      console.log(data);
    }
  })
})
// http://45.55.198.11:7777/nearest?zip_codes=77083,77006,77084&type=coffee
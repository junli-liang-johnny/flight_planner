$(".dropdown").on("show.bs.dropdown", (e) => {
  console.log('show');

});

$('.dropdown').on('hide.bs.dropdown', (e) => {
  console.log('hide');
  console.log(e);
});

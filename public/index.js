let form = $('#form');

let pageTitle = $('h1').text()

let inputs = $('.itemClass').data("item-class")

if (pageTitle === "Today") {
  $('.default').prop('checked', true)
} else {
  $("input[value='" + pageTitle + "']").prop("checked", true);
  $("input[value!='" + pageTitle + "']").prop("checked", false);
}

let categoryForm = $('.categoryDiv')

form.submit((e) => {
    let newItem = $('#Item').val();
    if (newItem.length == 0) {
        e.preventDefault();
        alert("Please enter a todo item");
    }
});

categoryForm.submit((e) => {
  let category = $('.categoryDiv input').val();
  if (category.length == 0) {
    e.preventDefault();
    alert("Please enter a todo category")
  }
})

const menuBtn = $('i.fa-solid')
const sideBar = $('.container')

var menuOpen = false;

menuBtn.click(() => {
    menuBtn.toggleClass('rotate-half')

    setTimeout(() => {
        menuBtn.toggleClass('fa-bars') // removes the bar-icon
        menuBtn.toggleClass('rotate-full fa-arrow-right-long') // rotates 
    }, 100)

    if (!menuOpen) {
        sideBar.css({
          "left": "1.8rem"
        });

        $("#overlay").css({
            "display": "block"
          });

        menuOpen = true;
      } else {
        sideBar.css({
          "left": "-450px"
        });

        $("#overlay").css({
            "display": "none"
          });

        menuOpen = false;
      }
})




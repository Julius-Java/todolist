let form = $('#form');

form.submit((e) => {
    let newItem = $('#Item').val();
    if (newItem.length == 0) {
        e.preventDefault();
        alert("Please enter a todo item");
    }
});

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
          "left": "0.9rem"
        });

        $("#overlay").css({
            "display": "block"
          });

        menuOpen = true;
      } else {
        sideBar.css({
          "left": "-400px"
        });

        $("#overlay").css({
            "display": "none"
          });

        menuOpen = false;
      }
})
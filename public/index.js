let form = $('#form');

form.submit((e) => {
    let newItem = $('#Item').val();
    if (newItem.length == 0) {
        e.preventDefault();
        alert("Please enter a todo item");
    }
});
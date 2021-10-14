let deleteButton = document.querySelectorAll(".btn-delete");

deleteButton.forEach((node) =>
  node.addEventListener("click", function (e) {
    e.preventDefault();

    if (confirm("Are you sure you want to delete this author??"))
      window.location = node.getAttribute("href");
  })
);

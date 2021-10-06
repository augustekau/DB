let deleteCompany = document.querySelectorAll(".btn-delete-company");

deleteCompany.forEach((node) =>
  node.addEventListener("click", function (e) {
    e.preventDefault();

    if (confirm("Ar tikrai norite pašalinti šiuos duomenis?"))
      window.location = node.getAttribute("href");
  })
);

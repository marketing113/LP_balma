const form = document.querySelector("#lead-form");
const statusNode = document.querySelector("#form-status");
const landingPageField = document.querySelector("#landing-page-field");

if (landingPageField) {
  landingPageField.value = window.location.href;
}

if (form) {
  form.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = form.querySelector('button[type="submit"]');
    const formData = new FormData(form);

    if (statusNode) {
      statusNode.textContent = "Envoi en cours...";
      statusNode.className = "form-status";
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Envoi en cours...";
    }

    const payload = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/lead", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Une erreur est survenue.");
      }

      form.reset();
      landingPageField.value = window.location.href;

      if (statusNode) {
        statusNode.innerHTML =
          'Merci. Votre demande a bien été envoyée. En attendant notre retour, vous pouvez découvrir <a href="https://celia-creation.fr" target="_blank" rel="noreferrer">CELIA Creation</a>.';
        statusNode.className = "form-status is-success";
      }
    } catch (error) {
      if (statusNode) {
        statusNode.textContent = error.message || "Impossible d'envoyer le formulaire pour le moment.";
        statusNode.className = "form-status is-error";
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Envoyer";
      }
    }
  });
}

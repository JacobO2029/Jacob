const STORAGE_KEY = "cs-quest-lab-data";
const ADMIN_PASSPHRASE = "owner-access";

const adminForm = document.getElementById("adminForm");
const dataBox = document.getElementById("dataBox");

function loadData() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { accounts: {}, activeAccount: null };
  }
  return JSON.parse(raw);
}

adminForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const formData = new FormData(adminForm);
  const passphrase = formData.get("passphrase");
  if (passphrase !== ADMIN_PASSPHRASE) {
    dataBox.textContent = "Access denied. Check the passphrase.";
    return;
  }
  const data = loadData();
  dataBox.textContent = JSON.stringify(data, null, 2);
});

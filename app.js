document.getElementById("sendBtn").addEventListener("click", sendMessage);
document.getElementById("uploadBtn").addEventListener("click", triggerImageInput);
document.getElementById("imageInput").addEventListener("change", uploadImage);

let apiKey = prompt("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:");

if (!apiKey) {
  alert("API key is required to use this app.");
  throw new Error("API key is missing");
}

async function sendMessage() {
  const message = document.getElementById("userInput").value;
  if (!message) return;

  appendMessage("You", message);
  document.getElementById("userInput").value = "";
  document.getElementById("userInput").disabled = true;
  document.getElementById("sendBtn").disabled = true;
  document.getElementById("loading").style.display = "block";

  try {
    const response = await fetchOpenAI(message);
    appendMessage("AI", response);
  } catch (error) {
    displayError(error.message);
  } finally {
    document.getElementById("userInput").disabled = false;
    document.getElementById("sendBtn").disabled = false;
    document.getElementById("loading").style.display = "none";
  }
}

async function fetchOpenAI(message) {
  const url = "https://api.openai.com/v1/completions";
  const headers = {
    "Content-Type": "application/json",
    "Authorization": `Bearer ${apiKey}`,
  };

  const body = JSON.stringify({
    model: "text-davinci-003",
    prompt: message,
    max_tokens: 100,
  });

  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: body,
  });

  const data = await response.json();
  
  if (data.error) {
    throw new Error(data.error.message);
  }
  
  return data.choices[0].text;
}

function appendMessage(sender, message) {
  const chatBox = document.getElementById("chat");
  chatBox.innerHTML += `<b>${sender}:</b> ${message}<br>`;
  chatBox.scrollTop = chatBox.scrollHeight;
}

function triggerImageInput() {
  document.getElementById("imageInput").click();
}

async function uploadImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  document.getElementById("loading").style.display = "block";

  const formData = new FormData();
  formData.append("file", file);

  try {
    const imageURL = await sendImageToServer(formData);
    appendMessage("You", `<img src="${imageURL}" style="max-width: 100%">`);
  } catch (error) {
    displayError(error.message);
  } finally {
    document.getElementById("loading").style.display = "none";
  }
}

async function sendImageToServer(formData) {
  const response = await fetch("/upload-image", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload image.");
  }

  const result = await response.json();
  return result.imageURL;
}

function displayError(errorMessage) {
  const errorElement = document.getElementById("error-message");
  errorElement.textContent = errorMessage;
  errorElement.style.display = "block";
}

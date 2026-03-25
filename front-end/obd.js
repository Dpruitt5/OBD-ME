function analyze() {
  const code = document.getElementById("code").value.toUpperCase();

  // Try backend first
  fetch("http://localhost:3000/analyze", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      code: code,
      car: document.getElementById("car").value
    })
  })
  .then(res => res.json())
  .then(data => {
    displayResults(data);
  })
  .catch(err => {
    console.log("Backend not connected, using mock data");
    useMockData(code); // fallback
  });
}

function useMockData(code) {
  const result = document.getElementById("result");
  const issue = document.getElementById("issue");
  const explanation = document.getElementById("explanation");
  const steps = document.getElementById("steps");
  const shops = document.getElementById("shops");

  steps.innerHTML = "";
  shops.innerHTML = "";

  if (code === "P0420") {
    issue.textContent = "Catalytic Converter Efficiency Below Threshold";

    explanation.textContent =
      "Your catalytic converter may not be working properly.";

    ["Check O2 sensor", "Inspect exhaust system", "Visit a mechanic"].forEach(step => {
      let li = document.createElement("li");
      li.textContent = step;
      steps.appendChild(li);
    });

    ["Joe's Auto Repair", "Precision Exhaust Shop"].forEach(shop => {
      let li = document.createElement("li");
      li.textContent = shop;
      shops.appendChild(li);
    });

  } else {
    issue.textContent = "Unknown Code";
    explanation.textContent = "We couldn't find this code.";
  }

  result.classList.remove("hidden");
}

function displayResults(data) {
  const result = document.getElementById("result");
  const issue = document.getElementById("issue");
  const explanation = document.getElementById("explanation");
  const steps = document.getElementById("steps");
  const shops = document.getElementById("shops");

  steps.innerHTML = "";
  shops.innerHTML = "";

  issue.textContent = data.issue;
  explanation.textContent = data.explanation;

  data.steps.forEach(step => {
    let li = document.createElement("li");
    li.textContent = step;
    steps.appendChild(li);
  });

  data.shops.forEach(shop => {
    let li = document.createElement("li");
    li.textContent = shop;
    shops.appendChild(li);
  });

  result.classList.remove("hidden");
}
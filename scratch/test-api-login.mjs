

async function test() {
  console.log("Sending POST to local login API...");
  const response = await fetch("http://localhost:3000/api/auth/patient/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      email: "john.doe@medlab.com",
      password: "medlab123456"
    })
  });

  console.log("Response Status:", response.status);
  const data = await response.json();
  console.log("Response Data:", JSON.stringify(data, null, 2));
}

test().catch(console.error);

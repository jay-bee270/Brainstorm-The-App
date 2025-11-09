export const testServerPayload = async () => {
  const BASE_URL = "https://brainstorm-r7xb.onrender.com"

  // Test 1: Minimal payload
  console.log("[DIAGNOSTIC] Test 1: Minimal payload")
  try {
    const minimalPayload = {
      username: "testuser123",
      email: "test@example.com",
      password: "password123",
      name: "Test User",
    }

    const response = await fetch(`${BASE_URL}/api/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(minimalPayload),
    })

    console.log("[DIAGNOSTIC] Test 1 Response Status:", response.status)
    const text = await response.text()
    console.log("[DIAGNOSTIC] Test 1 Response Body:", text)
  } catch (err) {
    console.error("[DIAGNOSTIC] Test 1 Error:", err)
  }

  // Test 2: With optional fields as empty strings
  console.log("\n[DIAGNOSTIC] Test 2: With optional fields (empty strings)")
  try {
    const withEmptyOptionals = {
      username: "testuser456",
      email: "test2@example.com",
      password: "password123",
      name: "Test User 2",
      bio: "",
      skills: [],
      interests: [],
    }

    const response = await fetch(`${BASE_URL}/api/users/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(withEmptyOptionals),
    })

    console.log("[DIAGNOSTIC] Test 2 Response Status:", response.status)
    const text = await response.text()
    console.log("[DIAGNOSTIC] Test 2 Response Body:", text)
  } catch (err) {
    console.error("[DIAGNOSTIC] Test 2 Error:", err)
  }

  // Test 3: Check if endpoint exists
  console.log("\n[DIAGNOSTIC] Test 3: Check endpoint availability")
  try {
    const response = await fetch(`${BASE_URL}/api/users/register`, {
      method: "OPTIONS",
    })

    console.log("[DIAGNOSTIC] Test 3 OPTIONS Status:", response.status)
  } catch (err) {
    console.error("[DIAGNOSTIC] Test 3 Error:", err)
  }
}

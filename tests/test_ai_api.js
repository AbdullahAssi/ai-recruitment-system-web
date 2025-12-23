// Test script to test AI processing from frontend
const testAIProcessing = async () => {
  try {
    const response = await fetch("http://localhost:3001/api/ai/process", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        resumeId: "cm2t02bnk0000wdayj14g8ak9",
      }),
    });

    const result = await response.json();
    console.log("API Response:", result);
  } catch (error) {
    console.error("Error:", error);
  }
};

testAIProcessing();

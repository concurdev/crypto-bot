import WebSocket from "ws";

// Create WebSocket connection to the server (assuming the server is running on ws://localhost:8383)
const socket = new WebSocket("ws://localhost:8383");

socket.onopen = () => {
  console.log("WebSocket connection established.");
  // You can now send messages to the server
  socket.send("Hello from client!");
};

socket.onmessage = (event) => {
  // Check if the message is a string or buffer
  if (typeof event.data === "string") {
    try {
      // Try to parse the message as JSON
      const data = JSON.parse(event.data);
      console.log("Received string data:", data);
    } catch (err) {
      // If it fails to parse, handle it as a regular string message
      console.log("Received non-JSON string data:", event.data);
    }
  } else if (event.data instanceof Buffer) {
    // If it's a Buffer, handle accordingly (for example, convert to string)
    const data = event.data.toString();
    console.log("Received buffer data:", data);
  }
};

socket.onclose = () => {
  console.log("WebSocket connection closed.");
};

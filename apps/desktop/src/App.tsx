import { useState } from "react";
import "./App.css";

function App() {
  const [greetMsg, setGreetMsg] = useState("");
  const [name, setName] = useState("");

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    // setGreetMsg(await invoke("greet", { name }));
    setGreetMsg("Hello " + name);
  }

  return (
    <div className="container">
      <h1>Welcome to Walrus</h1>
      <p>Click on the Tauri, Vite, and React logos to learn more.</p>
    </div>
  );
}

export default App;

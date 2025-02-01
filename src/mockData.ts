export const data = [
	{
		id: 1,
		title: 'React useState Example',
		code: `import { useState } from "react";
  import { invoke } from "@tauri-apps/api/core";ß
  import "./App.css";
  
  function App() 
    const [name, setName] = useState("");
    const [count, setCount] = useState(0);
      import { invoke } from "@tauri-apps/api/core";
  import "./App.css";
  
  function App() {
    const [name, setName] = useState("");
    const [count, setCount] = useState(0);
      import { invoke } from "@tauri-apps/api/core";
  import "./App.css";
  
  function App() {
    const [name, setName] = useState("");
    const [count, setCount] = useState(0);
      import { invoke } from "@tauri-apps/api/core";
  import "./App.css";
  
  function App() {
    const [name, setName] = useState("");
    const [count, setCount] = useState(0);
  }`,
		language: 'typescript',
		pattern: 'hooks'
	},
	{
		id: 2,
		title: 'Express Route Example',
		code: `app.get('/api/users', async (req, res) => {
    try {
      const users = await User.find();
      res.json(users);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  })`,
		language: 'javascript',
		pattern: 'backend'
	},
	{
		id: 3,
		title: 'React Component Example',
		code: `function UserProfile({ user }) {
    return (
      <div className="profile">
        <h2>{user.name}</h2>
        <p>{user.email}</p>
      </div>
    );
  }`,
		language: 'jsx',
		pattern: 'components'
	}
];

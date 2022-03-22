import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login() {
  let nav = useNavigate();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState('');

  const loginUser = async () => {
    let urlParams = new URLSearchParams();
    urlParams.append('username', username);
    urlParams.append('password', password);

    try {
      let response = await fetch(`/admin/login`, {
        method: "POST",
        body: urlParams,
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        credentials: "include",
      });
      const parsedResponse = await response.json();

      if (response.status === 200){
        console.log(parsedResponse.message);
        document.cookie = `loggedIn=true; max-age=${60 * 60 * 12}`;
        nav('/client');
      } else {
        // setError(parsedResponse.message);
        setError('Invalid credentials');
      }

    } catch(err) {
      console.log('----- Login ERROR -----');
      console.log(err);
    }
  }

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    loginUser();
  }

  return (
    <div className="flex items-center justify-center w-screen h-screen Login">
      <form
        className="flex flex-col max-w-sm p-6 bg-white rounded-md max-h-min drop-shadow"
        onSubmit={handleSubmit} >
        <h1 className="text-xl font-bold mb-2.5">Media Map Login</h1>
        <label htmlFor="username">Username</label>
        <input className="border px-4 py-1 mb-2.5" type="text" name="username" id="username" onChange={e => setUsername(e.target.value)}/>
        <label htmlFor="password">Password</label>
        <input className="px-2 py-1 border" type="password" name="password" id="password" onChange={e => setPassword(e.target.value)}/>
        <button 
          className="self-center px-6 py-1 mt-5 font-bold text-green-600 border border-green-600 rounded-full active:scale-95 hover:border-white w-min whitespace-nowrap hover:bg-gradient-to-tr from-green-600 to-green-400 hover:text-white"
          type="submit"
        >
          Log In
        </button>
        {
          error ?
          <div className="mt-5 text-sm font-bold text-center text-red-600">{error}</div>
          :
          null
        }
      </form>
    </div>
  );
}

export default Login;

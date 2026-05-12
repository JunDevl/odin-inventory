import { useRef, useState } from "react";
import type { SubmitEventHandler } from "react";
import { validateUser, createNewUser } from "../../../actions";
import { useNavigate } from "react-router";

import "./auth.css";

type AuthProps = {}

const Auth = (props: AuthProps) => {
  const navigate = useNavigate();

  const form = useRef<HTMLFormElement>(null);
  const [currentTab, setCurrentTab] = useState<"login" | "signup">("login");

  const handleSubmit: SubmitEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    const formData = new FormData(form.current!);

    const email = formData.get("email") as string;
    const pass = formData.get("password") as string;
    const init = !!formData.get("init");

    const {uuid, name} = form.current?.method === "get" ?
      await validateUser(email, pass) :
      await createNewUser(formData.get("username") as string, email, pass, init);

    localStorage.setItem("userUUID", uuid);
    localStorage.setItem("userName", name);
  }

  return (
    <div className="main">
      <main className="user_auth">
      <h1>Welcome, folk!</h1>
      <p>This is an inventory manager webapp created as a part of The Odin Project's curriculum.</p>

      <div className="auth">
        <nav className="tabs">
          <ul>
            <li 
              className={`tab${currentTab === "login" ? " selected" : ""}`}
              onClick={() => setCurrentTab("login")}
            >
              Log-in
            </li>
            <li 
              className={`tab${currentTab === "signup" ? " selected" : ""}`}
              onClick={() => setCurrentTab("signup")}
            >
              Sign-up
            </li>
          </ul>
        </nav>
        <form 
          className={currentTab} 
          method={`${currentTab === "login" ? "GET" : "POST"}`} 
          onSubmit={e => handleSubmit(e)}
          ref={form}
        >
          {currentTab === "login" &&
            <>
              <div className="input email">
                <label htmlFor="email">E-mail:</label>
                <input type="email" id="email" name="email" autoComplete="email" required/>
              </div>
              
              <div className="input password">
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" autoComplete="current-password" required/>
              </div>

              <button type="submit">
                Log-in!
              </button>
            </>
          }
          {currentTab === "signup" &&
            <>
              <div className="input username">
                <label htmlFor="username">Username:</label>
                <input type="text" id="username" name="username" autoComplete="name" required/>
              </div>

              <div className="input email">
                <label htmlFor="email">E-mail:</label>
                <input type="email" id="email" name="email" autoComplete="email" required/>
              </div>
              
              <div className="input password">
                <label htmlFor="password">Password:</label>
                <input type="password" id="password" name="password" autoComplete="current-password" required/>
              </div>

              <div className="check init">
                <label htmlFor="init">Start with example data</label>
                <input type="checkbox" name="init" id="init" value="true" checked/>
              </div>

              <button type="submit">
                Sign-up!
              </button>
            </>
            }
        </form>
        
      </div>
    </main>
    </div>
  )
}

export default Auth
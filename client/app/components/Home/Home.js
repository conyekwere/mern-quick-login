import React, { Component } from "react";
import "whatwg-fetch";
import { getFromStorage, setInStorage } from "../../utils/storage";

const localStorageObjectName = "login_system_storage";

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
      token: "", // if they have a token, they are signed in
      signUpError: "",
      signInError: "",
      signInEmail: "",
      signInPassword: "",
      signUpFirstName: "",
      signUpLastName: "",
      signUpEmail: "",
      signUpPassword: "",
      signUpError: ""
    };

    // Bind the functions so React can use them
    this.onTextboxChangeSignInEmail = this.onTextboxChangeSignInEmail.bind(
      this
    );
    this.onTextboxChangeSignInPassword = this.onTextboxChangeSignInPassword.bind(
      this
    );
    this.onTextboxChangeSignUpFirstName = this.onTextboxChangeSignUpFirstName.bind(
      this
    );
    this.onTextboxChangeSignUpLastName = this.onTextboxChangeSignUpLastName.bind(
      this
    );
    this.onTextboxChangeSignUpEmail = this.onTextboxChangeSignUpEmail.bind(
      this
    );
    this.onTextboxChangeSignUpPassword = this.onTextboxChangeSignUpPassword.bind(
      this
    );

    this.onSignIn = this.onSignIn.bind(this);
    this.onSignUp = this.onSignUp.bind(this);
    this.logout = this.logout.bind(this);
  }

  /**
   * Acquire token stored in local storage.
   * Use token to gather user information from DB.
   */
  componentDidMount() {
    // get the localstorage object
    const obj = getFromStorage(localStorageObjectName);
    if (obj && obj.token) {
      // get token from local storage
      const { token } = obj;

      // verify token
      fetch(`/api/account/verify?token=${token}`)
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            this.setState({
              token,
              isLoading: false
            });
          } else {
            this.setState({
              isLoading: false
            });
          }
        });
    } else {
      // there is no token
      this.setState({
        isLoading: false
      });
    }
  }

  /**
   * Runs when the user clicks the `sign up` button
   * 1. Grab state
   * 2. Post req to backend
   */
  onSignUp() {
    // grab state
    const {
      signUpFirstName,
      signUpLastName,
      signUpEmail,
      signUpPassword
    } = this.state;

    this.setState({
      isLoading: true
    });

    // Post req to backend
    fetch("/api/account/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        firstName: signUpFirstName,
        lastName: signUpLastName,
        email: signUpEmail,
        password: signUpPassword
      })
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          this.setState({
            signUpError: json.mes,
            isLoading: false,
            signUpEmail: "",
            signUpPassword: "",
            signUpFirstName: "",
            signUpLastName: ""
          });
        } else {
          this.setState({
            signUpError: json.mes,
            isLoading: false
          });
        }
      });
  }

  /**
   * 1. Grab state
   * 2. Post req to backend
   */
  onSignIn() {
    // grab state
    const { signInEmail, signInPassword } = this.state;

    this.setState({
      isLoading: true
    });

    // Post req to backend
    fetch("/api/account/signin", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: signInEmail,
        password: signInPassword
      })
    })
      .then(res => res.json())
      .then(json => {
        if (json.success) {
          setInStorage(localStorageObjectName, { token: json.token });
          this.setState({
            signInError: json.mes,
            isLoading: false,
            signInEmail: "",
            signInPassword: "",
            token: json.token
          });
        } else {
          this.setState({
            signInError: json.mes,
            isLoading: false
          });
        }
      });
  }

  logout() {
    this.setState({
      isLoading: true
    });
    // get the localstorage object
    const obj = getFromStorage(localStorageObjectName);
    if (obj && obj.token) {
      // get token from local storage
      const { token } = obj;

      // verify token
      fetch(`/api/account/logout?token=${token}`)
        .then(res => res.json())
        .then(json => {
          if (json.success) {
            this.setState({
              token: "",
              isLoading: false
            });
          } else {
            // some error
            this.setState({
              isLoading: false
            });
          }
        });
    } else {
      // there is no token
      this.setState({
        isLoading: false,
        token: ""
      });
    }
  }

  /**
   *
   * @param {Where the value of the text box goes} event
   */
  onTextboxChangeSignInEmail(event) {
    this.setState({
      signInEmail: event.target.value
    });
  }

  onTextboxChangeSignInPassword(event) {
    this.setState({
      signInPassword: event.target.value
    });
  }

  onTextboxChangeSignUpFirstName(event) {
    this.setState({
      signUpFirstName: event.target.value
    });
  }

  onTextboxChangeSignUpLastName(event) {
    this.setState({
      signUpLastName: event.target.value
    });
  }

  onTextboxChangeSignUpEmail(event) {
    this.setState({
      signUpEmail: event.target.value
    });
  }

  onTextboxChangeSignUpPassword(event) {
    this.setState({
      signUpPassword: event.target.value
    });
  }
  render() {
    const {
      isLoading,
      token,
      signInError,
      signUpError,
      signInEmail,
      signInPassword,
      signUpFirstName,
      signUpLastName,
      signUpEmail,
      signUpPassword
    } = this.state;

    
    const labelSpace = {
      margin: "-4px 6px",
      position: "absolute",
      fontSize: "11px",
      zIndex: "1",
      background: "white",
      padding: "0 7px 0 2px"
    };

    const inputContainer = {
      fontSize: "12px",
      height: "30px",
      width: "200px",
      borderRadius: "3px",
      border: "1px solid #ddd",
      paddingLeft: "5px"
    };

    if (isLoading) {
      return (
        <div>
          <p>Loading...</p>
        </div>
            
        
      );
    }

    if (!token) {
      return (
        <div>
          <div>
            {
              (signInError) ? (<p>{signInError}</p>): (null)
            }
            <p>Sign In</p>
            <label style={labelSpace}>Email</label>
            <input
              style={inputContainer}
              name="Email"
              type="email"
              placeholder="Enter email"
              value={signInEmail}
              onChange={this.onTextboxChangeSignInEmail}
              required
            ></input>
            <br></br>
            <br></br>
            <label style={labelSpace}>Password</label>
            <input
              style={inputContainer}
              name="Password"
              type="password"
              placeholder="Enter password"
              onChange={this.onTextboxChangeSignInPassword}
              value={signInPassword}
              required
            ></input>
          </div>
          <br></br>
          <br></br>
          <button onClick={this.onSignIn} >Sign in</button>
          <hr></hr>
          <div>
          {
              (signUpError) ? (<p>{signUpError}</p>): (null)
            }
            <p>Sign up</p>
            <label style={labelSpace}>First name</label>
            <input
              style={inputContainer}
              name="first name"
              type="text"
              placeholder="Enter First Name"
              onChange={this.onTextboxChangeSignUpFirstName}
              value={signUpFirstName}
              required
            ></input>
            <br></br>
            <br></br>
            <label style={labelSpace}>Last name</label>
            <input
              style={inputContainer}
              name="last name"
              type="text"
              placeholder="Enter Last name"
              onChange={this.onTextboxChangeSignUpLastName}
              value={signUpLastName}
              required
            ></input>
            <br></br>
            <br></br>
            <label style={labelSpace}>Email</label>
            <input
              style={inputContainer}
              name="Email"
              type="email"
              placeholder="Enter email"
              onChange={this.onTextboxChangeSignUpEmail}
              value={signUpEmail}
              required
            ></input>
            <br></br>
            <br></br>
            <label style={labelSpace}>Password</label>
            <input
              style={inputContainer}
              name="Password"
              type="password"
              placeholder="Enter password"
              onChange={this.onTextboxChangeSignUpPassword}
              value={signUpPassword}
              required
            ></input>
            <br></br>
            <br></br>
            <button onClick={this.onSignUp}>Sign up</button>
          </div>
        </div>
      );
    }

    return (
      <>
        <p>Account</p>
        <button onClick={this.logout}>Logout</button>
      </>
    );
  }
}

export default Home;

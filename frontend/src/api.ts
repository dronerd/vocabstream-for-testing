//reads an environment variable from the project
//for example, if in .env file I have REACt_APP_API_URL = https://myserver.com/api
//then the API_BASE will be set to "https://myserver.com/api
// the part after || is fallback when it is not set. 
const API_BASE = process.env.REACT_APP_API_URL || "http://127.0.0.1:8000/api";

//export function with two parameters, username and passowrd(both strings)
//the function is async, meaning it will return a Promise and i can use await inside it
export async function apiLogin(username: string, password: string) {
  //here, it is sending a requiret to API_BASE +"/login", like "http://127.....8000/api/login"
  const res = await fetch(`${API_BASE}/login`, {
    method: "POST",  
    //sends a POST request to sending data
    headers: { "Content-Type": "application/json" }, //tells the server we are sending JSON
    body: JSON.stringify({ username, password }), //converts username, passoword to JSON text
  }); 
  //therefore, the request body will look like this {"username":"bob", "passoword": "1234"}
  if (!res.ok) throw new Error("Login failed");
  //res.ok is true when HTTP status code is 200~299, which is success
  //if login request fails, such as HTTP status code 401, it throws an error
  return res.json();
}

//this function checks who the user is by sending the login token to /me endpoint of the backend
//if the token is valid, the server returns user information
//if it is not valid, it throws unauthorized
export async function apiMe(token: string) {
  const res = await fetch(`${API_BASE}/me?token=${encodeURIComponent(token)}`);
  //here, encodeURIComponent is used to encode special characters in a string to safely use inside of URL
  //example, URLs cannot contain spaces, ?, &, # etc so they are encoded
  //encodeURIComponent("rock & roll") will return "rock%20%26%20roll"
  if (!res.ok) throw new Error("unauthorized");
  return res.json();
}

export async function apiGenres() {
  const res = await fetch(`${API_BASE}/genres`);
  return res.json();
}

export async function apiLessons(genreId: string) {
  const res = await fetch(`${API_BASE}/lessons/${encodeURIComponent(genreId)}`);
  return res.json();
}

export async function apiLessonDetail(lessonId: string) {
  const res = await fetch(`${API_BASE}/lesson/${encodeURIComponent(lessonId)}`);
  return res.json();
}

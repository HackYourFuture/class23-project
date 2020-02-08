import cookie from "js-cookie";
import Router from "next/router";
import firebase from 'firebase';

export function handleLogin(token) {
  cookie.set("token", token);
  Router.push("/account");
}

export function redirectUser(ctx, location) {
  if (ctx.req) {
    ctx.res.writeHead(302, { Location: location });
    ctx.res.end();
  } else {
    Router.push(location);
  }
}

export async function handleLogout() {
  cookie.remove("token");
  if (firebase.auth().currentUser) {
    try {
      await firebase.auth().signOut();
    } catch (error) {
      console.error('Error while signing out from social user:', error.message);
    }
  }
  window.localStorage.setItem("logout", Date.now());
  Router.push("/login");
}

import cookie from "js-cookie";
import Router from "next/router";
import firebase from 'firebase';

export function handleLogin(token, ctx) {
  cookie.set("token", token);
  redirectUser(ctx, '/account');
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
  if (firebase.apps.length > 0) {
    try {
      firebase.apps.forEach(async app => {
        await app.auth().signOut();
      });
    } catch (error) {
      console.warn('Firebase sign out error: ', error);
    }
  }
  window.localStorage.setItem("logout", Date.now());
  Router.push("/login");
}

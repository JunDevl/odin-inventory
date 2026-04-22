import type { UUID } from "node:crypto";
import type { DataRoute, APICreateUpdateParams, RouteTableMapping } from "@app/utils";

const postHeaders: HeadersInit = {
  'content-type': "application/json"
}

export const validateUser = async (email: string, password: string) => {
  const data = await fetch(`${import.meta.env["VITE_API_URI"]!}/users/auth?email=${email}&pass=${password}`);

  const userUUID = await data.text();
  
  if (!data.ok) throw new Error(userUUID);

  return userUUID;
}

export const createNewUser = async (username: string, email: string, password: string, initData?: boolean) => {
  const body = JSON.stringify({ username, email, password, initData })

  const postUser = await fetch(
    `${import.meta.env["VITE_API_URI"]!}/users`,
    { 
      method: "POST", 
      headers: postHeaders, 
      body 
    }
  );

  if (!postUser.ok) throw new Error(await postUser.text());

  const createdUserUUID = await postUser.text();

  return createdUserUUID;
}

export const fetchAll = async (userID: UUID, route: DataRoute) => {
  let uri;
  let res: Record<string, any>[];

  if (route.includes("item")) {
    const itemRoute = route === "avaliable_items" ? "avaliable" : route === "item_categories" ? "categories" : "units"

    uri = `${import.meta.env["VITE_API_URI"]!}/${userID}/items/${itemRoute}`;
  }
  else uri = `${import.meta.env["VITE_API_URI"]!}/${userID}/${route}`;

  const data = await fetch(uri);

  if (!data.ok) {
    if (data.status === 404) return [];
    throw new Error(await data.text());
  }

  res = await data.json();

  for (const item of res) {
    for (const k of Object.keys(item)) {
      if (item[k] === null || !k.includes("date") || !k.includes("datetime") || !k.includes("at")) continue;
      item[k] = new Date(item[k]);
    }
  }

  return res as RouteTableMapping[typeof route][];
}

export const create = async <T extends DataRoute>(userID: UUID, route: T, params: APICreateUpdateParams[T]) => {
  const body = JSON.stringify(params);
  let uri;
  
  if (route.includes("item")) {
    const itemRoute = route === "avaliable_items" ? "avaliable" : route === "item_categories" ? "categories" : "units"

    uri = `${import.meta.env["VITE_API_URI"]!}/${userID}/items/${itemRoute}`;
  }
  else uri = `${import.meta.env["VITE_API_URI"]!}/${userID}/${route}`;

  const postData = await fetch(uri, { 
    method: "POST", 
    headers: postHeaders, 
    body 
  })

  if (!postData.ok) throw new Error(await postData.text());

  const created = await postData.text();

  return created;
}

export const update = async (userID: UUID, route: DataRoute) => {
  
}
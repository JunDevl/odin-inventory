import type { UUID } from "node:crypto";
import type { DataRoute, APICreateUpdateParams, RouteTableMapping, Prettify } from "@app/utils";

const dataRouteURI = (route: DataRoute, userID: UUID) => {
  let uri;

  if (route.includes("item")) {
    const itemRoute = route === "avaliable_items" ? "avaliable" : route === "item_categories" ? "categories" : "units"

    uri = `${import.meta.env["VITE_API_URI"]!}/${userID}/items/${itemRoute}`;
  }
  else uri = `${import.meta.env["VITE_API_URI"]!}/${userID}/${route}`;

  return uri;
}

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

export const fetchAll = async <T extends DataRoute>(route: T) => {
  const userID = localStorage.getItem("userUUID") as UUID;

  const uri = dataRouteURI(route, userID);
  let res: Record<string, any>[];

  const data = await fetch(uri);

  if (!data.ok) {
    if (data.status === 404) return [];
    throw new Error(await data.text());
  }

  res = await data.json();

  for (const item of res) {
    for (const k of Object.keys(item)) {
      if (item[k] === null || !k.includes("date") && !k.includes("datetime") && !k.includes("_at")) continue;
      item[k] = new Date(item[k]);
    }
  }

  return res as RouteTableMapping[typeof route][];
}

type CUDParams<T extends DataRoute> = Omit<APICreateUpdateParams[T], "userUuid">;

export const createData = async <T extends DataRoute>(route: T, params: CUDParams<T>) => {
  const userID = localStorage.getItem("userUUID") as UUID;

  Object.keys(params).forEach(paramKey => {
    if (paramKey.includes("cents")) (params[paramKey as keyof typeof params] as number) *= 100;
  })

  const body = JSON.stringify({userUuid: userID, ...params});
  const uri = dataRouteURI(route, userID);

  const postData = await fetch(uri, { 
    method: "POST", 
    headers: postHeaders, 
    body 
  })

  if (!postData.ok) throw new Error(await postData.text());

  const createdOK = await postData.text();

  return createdOK;
}

export const updateData = async <T extends DataRoute>(route: T, params: CUDParams<T>) => {
  
}

export const deleteDataArray = async <T extends DataRoute>(route: T, params: CUDParams<T>[]) => {
  
}
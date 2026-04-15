import type { UUID } from "crypto";

type Data = "stocks" | "operations" | "storages" | "entities" | "avaliable_items" | "item_categories"

export const validateUser = async (email: string, password: string) => {
  const data = await fetch(`${import.meta.env["VITE_API_URI"]!}/users/auth?email=${email}&pass=${password}`);

  const userUUID = await data.text();
  
  if (!data.ok) throw new Error(userUUID);

  return userUUID;
}

export const createNewUser = async (username: string, email: string, password: string, initData?: boolean) => {
  const headers: HeadersInit = {
    'content-type': "application/json"
  }
  const body = JSON.stringify({ username, email, password, initData })

  const postUser = await fetch(
    `${import.meta.env["VITE_API_URI"]!}/users`,
    { 
      method: "POST", 
      headers, 
      body 
    }
  );

  if (!postUser.ok) throw new Error(await postUser.text());

  const createdUserUUID = await postUser.text();

  // const 

  return createdUserUUID;
}

export const fetchAll = async (userID: UUID, dataName: Data) => {
  let data: Response;
  let res: Record<string, any>[];

  console.log(`${import.meta.env["VITE_API_URI"]!}/${userID}/${dataName}`);

  if (dataName === "item_categories" || dataName === "avaliable_items") 
    data = await fetch(`${import.meta.env["VITE_API_URI"]!}/${userID}/items/${dataName === "avaliable_items" ? "avaliable" : "categories"}`);
  else 
    data = await fetch(`${import.meta.env["VITE_API_URI"]!}/${userID}/${dataName}`);

  if (!data.ok) {
    if (data.status === 404) return [];
    throw new Error(await data.text());
  }

  res = await data.json();

  for (const item of res) {
    for (const k of Object.keys(item)) {
      if (typeof item[k] !== "string" || !k.includes("date") && !k.includes("datetime") && !k.includes("at")) continue;
      item[k] = new Date(item[k])
    }
  }

  return res;
}
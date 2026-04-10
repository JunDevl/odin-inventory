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

export const fetchAll = async (dataName: Data) => {
  let data: Response;
  let res: any[];

  if (dataName !== "avaliable_items" || dataName !== "avaliable_items") {
    data = await fetch(`${import.meta.env["VITE_API_URI"]!}/${dataName}`);
  } else {
    data = await fetch(`${import.meta.env["VITE_API_URI"]!}/items/${dataName === "avaliable_items" ? "avaliable" : "categories"}`);
  }

  if (!data.ok) {
    if (data.status === 404) return [];
    throw new Error(await data.text());
  }

  res = await data.json();

  return res;
}
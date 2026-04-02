type Data = "stocks" | "operations" | "storages" | "entities" | "avaliable_items" | "item_categories"

export const validateUser = async (email: string, password: string) => {
  const data = await fetch(`${import.meta.env["VITE_API_URI"]!}/users/auth?email=${email}&pass=${password}`);

  const userUUID = await data.text();

  if (!data.ok) throw new Error(userUUID);

  return userUUID;
}

export const createNewUser = async (username: string, email: string, password: string) => {
  try {
    const headers: HeadersInit = {
      'content-type': "application/json"
    }
    const body = JSON.stringify({ username, email, password })

    const postUser = await fetch(
      `${import.meta.env["VITE_API_URI"]!}/users`, 
      { 
        method: "POST", 
        headers, 
        body 
      }
    );

    if (!postUser.ok) {
      const errorRes = await postUser.json();
      throw new Error(errorRes);
    }

    const createdUserUUID = await postUser.text();

    return createdUserUUID;
  } catch (e) {
    throw new Error(e as string);
  }
}

export const fetchAll = async (dataName: Data) => {
  try {
    let data: Response;
    let res: any[];

    if (dataName !== "avaliable_items" || dataName !== "avaliable_items") {
      data = await fetch(`${import.meta.env["VITE_API_URI"]!}/${dataName}`);
      res = await data.json();

      return res;
    }

    data = await fetch(`${import.meta.env["VITE_API_URI"]!}/items/${dataName === "avaliable_items" ? "avaliable" : "categories"}`);
    res = await data.json();

    return res;
  } catch (e) {
    console.log(e);
  }
}
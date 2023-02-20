export interface ServerError {
  error: string;
}

export interface UserData {
  id: number;
  name: string;
  role: string;
}

export type AuthResult = ServerError | UserData;

class AServerAPI {
  async encryptString(text: string): Promise<string> {
    const res = await fetch("/api/encrypt", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });
    if (res.status === 200) {
      return await res.json();
    }
    return "";
  }

  async authenticate(name: string, pass: string): Promise<AuthResult> {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, pass }),
    });
    return await res.json();
  }
}

const ServerAPI = new AServerAPI();
export default ServerAPI;

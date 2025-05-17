import { DeleteRowResult, InsertRowResult, ServerError } from "../../../../serverAPI";
import {
  JobCredentialData,
  RequestBody_CreateJobCredential,
  RequestBody_DeleteJobCredential,
  ServerJobCredentialData,
} from "./types";

function ConvertToServer(datum: JobCredentialData): ServerJobCredentialData {
  return {
    ...datum,
    // Any data type conversions go here.
  };
}

function ConvertToLocal(datum: ServerJobCredentialData): JobCredentialData {
  return {
    ...datum,
    // Any data type conversions go here.
  };
}

class AServerAPIJobCredentials {
  async fetch(): Promise<ServerError | JobCredentialData[]> {
    const res = await fetch("/api/tables/job_credentials/queries/fetch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const serverData: ServerError | ServerJobCredentialData[] = await res.json();
    if ("error" in serverData) {
      return serverData;
    } else {
      const data: JobCredentialData[] = serverData.map(ConvertToLocal);
      return data;
    }
  }

  async create(datum: JobCredentialData): Promise<InsertRowResult> {
    const requestBody: RequestBody_CreateJobCredential = {
      datum: ConvertToServer(datum),
    };
    const res = await fetch("/api/tables/job_credentials/queries/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async edit(datum: JobCredentialData): Promise<InsertRowResult> {
    const requestBody: RequestBody_CreateJobCredential = {
      datum: ConvertToServer(datum),
    };
    const res = await fetch("/api/tables/job_credentials/queries/edit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async delete(id: number): Promise<DeleteRowResult> {
    const requestBody: RequestBody_DeleteJobCredential = {
      id,
    };
    const res = await fetch("/api/tables/job_credentials/queries/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }
}

export const ServerAPIJobCredentials = new AServerAPIJobCredentials();

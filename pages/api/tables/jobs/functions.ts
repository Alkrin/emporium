import { DeleteRowResult, InsertRowResult, ServerError } from "../../../../serverAPI";
import { JobData, RequestBody_CreateJob, RequestBody_DeleteJob, ServerJobData } from "./types";

function ConvertToServer(datum: JobData): ServerJobData {
  return {
    ...datum,
    // Any data type conversions go here.
    credentials: JSON.stringify(datum.credentials),
    alternate_credentials: JSON.stringify(datum.alternate_credentials),
  };
}

function ConvertToLocal(datum: ServerJobData): JobData {
  return {
    ...datum,
    // Any data type conversions go here.
    has_subtypes: !!datum.has_subtypes, // Convert from number to explicit boolean.
    credentials: JSON.parse(datum.credentials),
    alternate_credentials: JSON.parse(datum.alternate_credentials),
  };
}

class AServerAPIJob {
  async fetch(): Promise<ServerError | JobData[]> {
    const res = await fetch("/api/tables/jobs/queries/fetch", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const serverData: ServerError | ServerJobData[] = await res.json();
    if ("error" in serverData) {
      return serverData;
    } else {
      const data: JobData[] = serverData.map(ConvertToLocal);
      return data;
    }
  }

  async create(datum: JobData): Promise<InsertRowResult> {
    const requestBody: RequestBody_CreateJob = {
      datum: ConvertToServer(datum),
    };
    const res = await fetch("/api/tables/jobs/queries/create", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async edit(datum: JobData): Promise<InsertRowResult> {
    const requestBody: RequestBody_CreateJob = {
      datum: ConvertToServer(datum),
    };
    const res = await fetch("/api/tables/jobs/queries/edit", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }

  async delete(id: number): Promise<DeleteRowResult> {
    const requestBody: RequestBody_DeleteJob = {
      id,
    };
    const res = await fetch("/api/tables/jobs/queries/delete", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });
    return await res.json();
  }
}

export const ServerAPIJob = new AServerAPIJob();

import { RequestBody_DeleteSingleEntry } from "../../../../serverRequestTypes";

// The data as used by the UI.
export interface JobCredentialData {
  id: number;
  name: string;
}

// The data as stored on the server.
export type ServerJobCredentialData = JobCredentialData;

// Request types.
export interface RequestBody_CreateJobCredential {
  datum: ServerJobCredentialData;
}

export interface RequestBody_EditJobCredential {
  datum: ServerJobCredentialData;
}

export type RequestBody_DeleteJobCredential = RequestBody_DeleteSingleEntry;

import { RequestBody_DeleteSingleEntry } from "../../../../serverRequestTypes";

export interface JobData_CredentialRequirement {
  credential_id: number;
  subtype: string;
  ranks: number;
}

// The data as used by the UI.
export interface JobData {
  id: number;
  name: string;
  has_subtypes: boolean;
  wage: number;
  /** Maps credentialId and subtype to required credential rank. */
  credentials: JobData_CredentialRequirement[];
  /** Each top-level entry is an array of credentials, of which at least ONE is required.
   * For instance, Marshall (Light Cavalry) requires either the Mounted Combat or Riding proficiency.
   */
  alternate_credentials: JobData_CredentialRequirement[][];
}

// The data as stored on the server.
export type ServerJobData = Omit<JobData, "credentials" | "alternate_credentials"> & {
  credentials: string;
  alternate_credentials: string;
};

// Request types.
export interface RequestBody_CreateJob {
  datum: ServerJobData;
}

export interface RequestBody_EditJob {
  datum: ServerJobData;
}

export type RequestBody_DeleteJob = RequestBody_DeleteSingleEntry;

import { createSlice } from "@reduxjs/toolkit";
import { PayloadAction } from "@reduxjs/toolkit/dist/createAction";
import { Dictionary } from "../lib/dictionary";
import { ContractData } from "../serverAPI";

interface ContractsReduxState {
  allContracts: Dictionary<ContractData>;
  contractsByDefByPartyAId: Dictionary<Dictionary<ContractData[]>>;
  contractsByDefByPartyBId: Dictionary<Dictionary<ContractData[]>>;
}

function buildDefaultContractsReduxState(): ContractsReduxState {
  const defaults: ContractsReduxState = {
    allContracts: {},
    contractsByDefByPartyAId: {},
    contractsByDefByPartyBId: {},
  };
  return defaults;
}

export const contractsSlice = createSlice({
  name: "contracts",
  initialState: buildDefaultContractsReduxState(),
  reducers: {
    updateContracts: (state: ContractsReduxState, action: PayloadAction<Dictionary<ContractData>>) => {
      state.allContracts = action.payload;
      state.contractsByDefByPartyAId = {};
      state.contractsByDefByPartyBId = {};
      Object.values(action.payload).forEach((contract) => {
        if (contract.party_a_id) {
          if (!state.contractsByDefByPartyAId[contract.def_id]) {
            state.contractsByDefByPartyAId[contract.def_id] = {};
          }
          if (!state.contractsByDefByPartyAId[contract.def_id]?.[contract.party_a_id]) {
            state.contractsByDefByPartyAId[contract.def_id][contract.party_a_id] = [];
          }
          state.contractsByDefByPartyAId[contract.def_id][contract.party_a_id].push(contract);
        }
        if (contract.party_b_id) {
          if (!state.contractsByDefByPartyBId[contract.def_id]) {
            state.contractsByDefByPartyBId[contract.def_id] = {};
          }
          if (!state.contractsByDefByPartyBId[contract.def_id]?.[contract.party_b_id]) {
            state.contractsByDefByPartyBId[contract.def_id][contract.party_b_id] = [];
          }
          state.contractsByDefByPartyBId[contract.def_id][contract.party_b_id].push(contract);
        }
      });
    },
    updateContract: (state: ContractsReduxState, action: PayloadAction<ContractData>) => {
      const contract = action.payload;
      state.allContracts[action.payload.id] = action.payload;
      if (contract.party_a_id) {
        if (!state.contractsByDefByPartyAId[contract.def_id]) {
          state.contractsByDefByPartyAId[contract.def_id] = {};
        }
        if (!state.contractsByDefByPartyAId[contract.def_id]?.[contract.party_a_id]) {
          state.contractsByDefByPartyAId[contract.def_id][contract.party_a_id] = [];
        }
        const index = state.contractsByDefByPartyAId[contract.def_id][contract.party_a_id].findIndex((c) => {
          return c.id === contract.id;
        });
        if (index === -1) {
          state.contractsByDefByPartyAId[contract.def_id][contract.party_a_id].push(contract);
        } else {
          state.contractsByDefByPartyAId[contract.def_id][contract.party_a_id][index] = contract;
        }
      }
      if (contract.party_b_id) {
        if (!state.contractsByDefByPartyBId[contract.def_id]) {
          state.contractsByDefByPartyBId[contract.def_id] = {};
        }
        if (!state.contractsByDefByPartyBId[contract.def_id][contract.party_b_id]) {
          state.contractsByDefByPartyBId[contract.def_id][contract.party_b_id] = [];
        }
        const index = state.contractsByDefByPartyBId[contract.def_id][contract.party_b_id].findIndex((c) => {
          return c.id === contract.id;
        });
        if (index === -1) {
          state.contractsByDefByPartyBId[contract.def_id][contract.party_b_id].push(contract);
        } else {
          state.contractsByDefByPartyBId[contract.def_id][contract.party_b_id][index] = contract;
        }
      }
    },
    deleteContract: (state: ContractsReduxState, action: PayloadAction<number>) => {
      const oldContract = state.allContracts[action.payload];
      if (oldContract) {
        if (oldContract.party_a_id) {
          state.contractsByDefByPartyAId[oldContract.def_id][oldContract.party_a_id] = state.contractsByDefByPartyAId[
            oldContract.def_id
          ][oldContract.party_a_id].filter((c) => {
            return c.id !== action.payload;
          });
        }
        if (oldContract.party_b_id) {
          state.contractsByDefByPartyBId[oldContract.def_id][oldContract.party_b_id] = state.contractsByDefByPartyBId[
            oldContract.def_id
          ][oldContract.party_b_id].filter((c) => {
            return c.id !== action.payload;
          });
        }
      }
      delete state.allContracts[action.payload];
    },
  },
});

export const { updateContracts, updateContract, deleteContract } = contractsSlice.actions;

import { Member } from "../types";
import { MEMBERS } from "./dummy-data";

export const membersRepository = {
  list(): Member[] {
    return [...MEMBERS];
  },

  getById(id: string): Member | undefined {
    return MEMBERS.find((m) => m.id === id);
  },
};

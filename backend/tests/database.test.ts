/// <reference types="jest" />

import { describe, expect, it, jest } from "@jest/globals";
import { prisma, connectDatabase, disconnectDatabase } from "../src/config/database";

describe("database lifecycle helpers", () => {
  it("connects and disconnects Prisma", async () => {
    const connect = jest.spyOn(prisma, "$connect").mockResolvedValue(undefined);
    const disconnect = jest.spyOn(prisma, "$disconnect").mockResolvedValue(undefined);

    await connectDatabase();
    await disconnectDatabase();

    expect(connect).toHaveBeenCalled();
    expect(disconnect).toHaveBeenCalled();
  });
});
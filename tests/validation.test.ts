/// <reference types="jest" />

import express from "express";
import { describe, expect, it } from "@jest/globals";
import request from "supertest";
import { z } from "zod";
import { validate } from "../src/middleware/validation.middleware";

describe("query validation", () => {
  it("normalizes query values without replacing Express 5's getter-only query property", async () => {
    const app = express();
    const querySchema = z.object({
      page: z.coerce.number().int().positive().default(1),
    });

    app.get("/items", validate(querySchema, "query"), (req, res) => {
      res.json(req.query);
    });

    const response = await request(app).get("/items?page=2");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ page: 2 });
  });
});
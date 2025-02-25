import { test as teardown } from "@playwright/test";

teardown("Reset the database and the drop the template database", async () => {
    console.log("Database reset");
});

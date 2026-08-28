import { expect, test } from "@playwright/test";

test.describe("Authentication Pages", () => {
  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page.getByRole("heading", { name: "Seu CPF" })).toBeVisible();
    await expect(page.getByLabel("CPF")).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  });

  test("rejects an invalid CPF", async ({ page }) => {
    await page.goto("/login");
    await page.getByLabel("CPF").fill("111.111.111-11");
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(
      page.getByText("Esse CPF não parece válido.", { exact: false })
    ).toBeVisible();
  });

  test("logs in with a new CPF and resumes the same account on a second login", async ({
    page,
  }) => {
    const cpf = "52998224725"; // known-valid CPF (public check-digit example)

    await page.goto("/login");
    await page.getByLabel("CPF").fill(cpf);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL("/");

    await page.context().clearCookies();
    await page.goto("/login");
    await page.getByLabel("CPF").fill(cpf);
    await page.getByRole("button", { name: "Entrar" }).click();
    await expect(page).toHaveURL("/");
  });
});

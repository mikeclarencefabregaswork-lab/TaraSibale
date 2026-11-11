import assert from "node:assert/strict";
import { test } from "node:test";
import { answerPortfolioGuide } from "../src/portfolioGuide.ts";

test("the guide answers named beach and food questions from the catalog", () => {
  assert.match(answerPortfolioGuide("Tell me about Guiwanon").reply, /Guiwanon.*white-sand/is);
  assert.match(answerPortfolioGuide("What local seafood and dishes are documented?").reply, /Leche Flan/i);
  assert.match(answerPortfolioGuide("Tell me about Coco Jam").reply, /Kaagapay/i);
});

test("the guide distinguishes the town feast from an unconfirmed barangay fiesta", () => {
  assert.match(answerPortfolioGuide("Kailan ang pista sa Sibale?").reply, /December 8/);
  const local = answerPortfolioGuide("When is the Poblacion fiesta?").reply;
  assert.match(local, /Poblacion.*to be confirmed/is);
  assert.doesNotMatch(local, /December 8/);
});

test("travel and lodging replies carry their verification limits", () => {
  const ferry = answerPortfolioGuide("Is the Pinamalayan ferry running now?").reply;
  assert.match(ferry, /confirm.*(?:port|operator)/is);
  assert.doesNotMatch(ferry, /\d+:\d+|safe to sail/i);
  assert.match(answerPortfolioGuide("Where can I stay?").reply, /TDL Lodge.*unconfirmed/is);
});

test("known phrases get translations and out-of-scope prompts get supported topics", () => {
  assert.match(answerPortfolioGuide("How do I say thank you in Asi?").reply, /Salamat.*Thank you/is);
  assert.match(answerPortfolioGuide("Write a sorting algorithm").reply, /I can help with.*beaches/is);
});

#!/usr/bin/env node

import {
  intro,
  select,
  text,
  outro,
  spinner,
  multiselect,
  confirm,
} from "@clack/prompts";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import figlet from "figlet";
import chalkAnimation from "chalk-animation";
import chalk from "chalk";
import * as emoji from "node-emoji";

function displayHeader() {
  const animation = chalkAnimation.glitch(
    figlet.textSync("ViteTail Starter", {
      font: "Standard",
      horizontalLayout: "default",
      verticalLayout: "default",
    })
  );

  setTimeout(() => {
    animation.stop(); // Stop the animation after 2 seconds
    process.stdout.write("\n"); // Add a new line after stopping the animation
    main().catch(console.error); // Call main function after stopping the animation
  }, 2000);
}

async function main() {
  const frameworkOptions = [
    { value: "vanilla", label: `${emoji.get("icecream")} Vanilla` },
    { value: "vue", label: `${emoji.get("atom_symbol")} Vue` },
    { value: "react", label: `${emoji.get("large_blue_diamond")} React` },
    { value: "preact", label: `${emoji.get("leaves")} Preact` },
    { value: "lit", label: `${emoji.get("star2")} Lit` },
    // { value: "svelte", label: `${emoji.get("orange_heart")} Svelte` },
    { value: "solid", label: `${emoji.get("rocket")} Solid` },
    // { value: "qwik", label: `${emoji.get("globe_with_meridians")} Qwik` },
  ];

  const linterOptions = [
    { value: "eslint", label: `${emoji.get("white_check_mark")} ESLint` },
    // { value: "tslint", label: `${emoji.get("no_entry")} TSLint (deprecated)` },
    { value: "prettier", label: `${emoji.get("nail_care")} Prettier` },
    // { value: "standard", label: `${emoji.get("barber")} Standard` },
    // { value: "airbnb", label: `${emoji.get("house_with_garden")} Airbnb` },
    // { value: "google", label: `${emoji.get("earth_americas")} Google` },
    { value: "none", label: `${emoji.get("no_entry_sign")} None` },
  ];

  intro(`${emoji.get("rocket")} Create a new Vite project with Tailwind CSS`);

  var projectName = await text({
    message: `${emoji.get("memo")} What is the name of your project?`,
    placeholder: "my-vite-project",
  });

  if (projectName === "" || projectName === undefined) {
    projectName = "my-vite-project";
  }

  console.log(chalk.yellow(`Name: ${projectName}`));

  const framework = await select({
    message: `${emoji.get("bulb")} Select a template`,
    options: frameworkOptions,
  });

  const label = frameworkOptions.find((o) => o.value === framework).label;
  //   console.log(chalk.white(chalk.bgYellow(`("Framework:")) ${label}`
  console.log();

  const needTypeScript = await confirm({
    message: `${emoji.get(
      "thought_balloon"
    )} Do you need TypeScript support for ${label}?`,
    initial: true, // Default to true (Yes)
  });
  console.log(chalk.yellow(`TypeScript: ${needTypeScript}`));

  const linter = await select({
    message: `${emoji.get("gear")} Select a linter`,
    options: linterOptions,
  });

  var linterLabel = linterOptions.find((o) => o.value === linter).label;
  console.log(chalk.yellow(`Linter: ${linterLabel}`));

  const needTailwind = await confirm({
    message: `${emoji.get("thought_balloon")} Do you need Tailwind CSS?`,
    initial: true, // Default to true (Yes)
  });
  console.log(chalk.yellow(`Tailwind CSS: ${needTailwind}`));

  // npm create vite@latest my-vue-app -- --template vue
  // this is the command 
}

displayHeader();
// main().catch(console.error);

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
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import figlet from "figlet";
import chalkAnimation from "chalk-animation";
import chalk from "chalk";
import * as emoji from "node-emoji";
import process from "process";

function setupGracefulExit() {
  const gracefulExit = () => {
    console.log(chalk.red("\nGracefully exiting..."));
    process.exit(0);
  };

  process.on("SIGINT", gracefulExit); // Handle Ctrl+C
  process.on("SIGTERM", gracefulExit); // Handle termination signals
  process.on("uncaughtException", (err) => {
    console.error("Uncaught Exception:", err);
    gracefulExit();
  });
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
    gracefulExit();
  });
}

function displayHeader() {
  const animation = chalkAnimation.neon(
    figlet.textSync(`ViteTail Starter`, {
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

  intro(
    `${emoji.get(
      "rocket"
    )} Create a new Vite project with Tailwind CSS ${emoji.emojify(":zap:")}`
  );

  var projectName = await text({
    message: `${emoji.get("memo")} What is the name of your project?`,
    placeholder: "my-vite-project",
  });

  if (projectName === "" || projectName === undefined) {
    projectName = "my-vite-project";
  }

  var framework = await select({
    message: `${emoji.get("bulb")} Select a template`,
    options: frameworkOptions,
  });

  var label = frameworkOptions.find((o) => o.value === framework).label;
  //   console.log(chalk.white(chalk.bgYellow(`("Framework:")) ${label}`
  // console.log(chalk.bgRedBright(chalk.white("Selected")), chalk.yellow(label));

  const needTypeScript = await confirm({
    message: `${emoji.get(
      "thought_balloon"
    )} Do you need TypeScript support for ${label}?`,
    initial: true, // Default to true (Yes)
  });

  if (needTypeScript) framework += "-ts";
  var install_command = `npm create vite@latest ${projectName} -- --template ${framework}`;
  console.log(install_command);

  const linter = await select({
    message: `${emoji.get("gear")} Select a linter`,
    options: linterOptions,
  });

  const needTailwind = await confirm({
    message: `${emoji.get("thought_balloon")} Do you need Tailwind CSS?`,
    initial: true, // Default to true (Yes)
  });

  // after all the prompts, install the project
  const spin = spinner();

  const projectPath = path.join(process.cwd(), projectName);
  if (fs.existsSync(projectPath)) {
    const files = fs.readdirSync(projectPath);
    if (files.length > 0) {
      console.error(
        `${emoji.get(
          "warning"
        )} Error: target directory ${projectName} is not empty.`
      );
      process.exit(1);
    }
  } else {
    fs.mkdirSync(projectPath);
  }

  exec(install_command, { cwd: process.cwd() }, (error, stdout, stderr) => {
    spin.start(
      chalk.bgYellow(
        `${emoji.get(
          "hammer_and_wrench"
        )} Building your preferred template of Vite app`
      )
    );
    console.log(chalk.blueBright(install_command));
    if (error) {
      spin.stop(`${emoji.get("x")} Failed to create the project.`);
      console.error(chalk.red(stderr));
      process.exit(1);
    } else {
      console.log(chalk.gray(stdout));
      process.chdir(projectPath);
      exec("npm install", (error, stdout, stderr) => {
        spin.start(
          chalk.bgYellow(
            `${emoji.get("hammer_and_wrench")} Installing dependencies`
          )
        );
        console.log(chalk.blueBright("npm install"));
        if (error) {
          spin.stop(`${emoji.get("x")} Failed to install dependencies.`);
          console.error(chalk.red(stderr));
          process.exit(1);
        } else {
          console.log(chalk.gray(stdout));
          const linterCommand = linter === "none" ? "" : `npx ${linter} --init`;

          //! eslint-config-standard
          //! 1npm init @eslint/config@latest -- --config eslint-config-standard

          //for prettier
          // npm install --save-dev --save-exact prettier
          // Then, create an empty config file to let editors and other tools know you are using Prettier:
          // node --eval "fs.writeFileSync('.prettierrc','{}\n')"

          // complete the linter setup
          // if (linter !== "none") {
          //   exec(linterCommand, (error, stdout, stderr) => {
          //     if (error) {
          //       spin.stop(`${emoji.get("x")} Failed to initialize linter.`);
          //       console.error(chalk.red(stderr));
          //       process.exit(1);
          //     } else {
          //       console.log(chalk.gray(stdout));
          //       spin.stop(
          //         chalk.bgGreenBright(
          //           chalk.bgGreenBright("Project created successfully! 🚀")
          //         )
          //       );
          //       process.exit(0);
          //     }
          //   });
          // }

          if (!needTailwind) {
            spin.stop(
              chalk.bgGreenBright(
                chalk.bgGreenBright("Project created successfully! 🚀")
              )
            );
            process.exit(0);
          } else {
            exec(
              "npm install -D tailwindcss@latest postcss@latest autoprefixer@latest",
              (error, stdout, stderr) => {
                spin.start(
                  chalk.bgYellow(
                    `${emoji.get("hammer_and_wrench")} Installing Tailwind CSS`
                  )
                );
                console.log(
                  chalk.blueBright(
                    "npm install -D tailwindcss postcss autoprefixer"
                  )
                );
                if (error) {
                  spin.stop(
                    `${emoji.get("x")} Failed to install Tailwind CSS.`
                  );
                  console.error(chalk.red(stderr));
                  process.exit(1);
                } else {
                  console.log(chalk.gray(stdout));
                }
              }
            );
          }
        }
      });
    }
  });

  // setTimeout(() => {
  //   spin.stop(
  //     chalk.bgGreenBright(chalk.blackBright("Project created successfully! 🚀"))
  //   );
  // }, 2000);
  // console.log(
  //   chalk.bgRedBright(chalk.white("  Selected  ")),
  //   chalk.yellow(`Tailwind CSS: ${needTailwind}`)
  // );

  // npm create vite@latest my-vue-app -- --template vue --typescript
  // npm create vite@latest my-react-app -- --template react-ts
  // this is the command
}

displayHeader();
// main().catch(console.error);

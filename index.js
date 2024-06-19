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

function installTailwind(framework, projectPath, projectName, spin) {
  exec(
    "npm install -D tailwindcss postcss autoprefixer",
    { cwd: projectPath },
    (error, stdout, stderr) => {
      if (error) {
        console.error(chalk.red(`Failed to install Tailwind CSS: ${stderr}`));
        process.exit(1);
      } else {
        console.log(chalk.bgBlue("running"), chalk.gray(stdout));

        exec(
          "npx tailwindcss init -p",
          { cwd: projectPath },
          (error, stdout, stderr) => {
            if (error) {
              console.error(
                chalk.red(`Failed to initialize Tailwind CSS: ${stderr}`)
              );
              process.exit(1);
            } else {
              console.log(chalk.bgBlue("running"), chalk.gray(stdout));

              const tailwindConfig = `
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{html,js,jsx,ts,tsx,vue,svelte}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
          `;
              fs.writeFileSync(
                path.join(projectPath, "tailwind.config.js"),
                tailwindConfig
              );

              const tailwindCSS = `
@tailwind base;
@tailwind components;
@tailwind utilities;
          `;
              fs.writeFileSync(
                path.join(projectPath, "src", "style.css"),
                tailwindCSS
              );

              const mainFile = `main.${framework.includes("ts") ? "ts" : "js"}`;
              const mainFilePath = path.join(projectPath, "src", mainFile);

              if (fs.existsSync(mainFilePath)) {
                let mainJS = fs.readFileSync(mainFilePath, "utf8");
                mainJS = mainJS.replace(
                  /import ['"].\/style.css['"];/,
                  `import './style.css';`
                );
                fs.writeFileSync(mainFilePath, mainJS);
              }

              console.log(
                chalk.green(
                  `Tailwind CSS installed and configured successfully for ${framework}.`
                )
              );
              spin.stop(
                chalk.bgGreenBright("Project created successfully! 🚀")
              );
              process.exit(0);
            }
          }
        );
      }
    }
  );
}

const stubFunctions = {
  react: (projectPath, projectName, isTs) => {
    const extension = isTs ? "tsx" : "jsx";
    const code = `
import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import './index.css'; // Assuming your Tailwind CSS is imported here

function Counter() {
  const [count, setCount] = useState(0);

  return (
    <div className="text-center">
      <p className="text-xl font-bold">Count: {count}</p>
      <button className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4" onClick={() => setCount(count + 1)}>Increment</button>
    </div>
  );
}

function App() {
  return (
    <div className="bg-gray-200 min-h-screen flex flex-col justify-center items-center">
      <h1 className="text-3xl font-bold mb-4">Welcome to Your React App</h1>
      <Counter />
      <footer className="absolute bottom-0 mb-4">
        <a href="https://github.com/ShantanuKudva/ShantanuKudva" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">GitHub</a>
      </footer>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
`;
    fs.writeFileSync(path.join(projectPath, "src", `main.${extension}`), code);
  },

  vue: (projectPath, projectName, isTs) => {
    const scriptType = isTs ? 'lang="ts"' : "";
    const appCode = `
<template>
  <div id="app" class="bg-gray-200 min-h-screen flex flex-col justify-center items-center">
    <h1 class="text-3xl font-bold mb-4">Welcome to Your Vue App</h1>
    <Counter />
    <footer class="absolute bottom-0 mb-4">
      <a href="https://github.com/ShantanuKudva/ShantanuKudva" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">GitHub</a>
    </footer>
  </div>
</template>

<script ${scriptType}>
import Counter from './Counter.vue';

export default {
  name: 'App',
  components: {
    Counter
  }
}
</script>

<style>
@import './style.css';
</style>
`;

    const counterCode = `
<template>
  <div>
    <p class="text-xl font-bold">Count: {{ count }}</p>
    <button @click="increment" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">Increment</button>
  </div>
</template>

<script setup ${scriptType}>
import { ref } from 'vue';

const count = ref(0);

function increment() {
  count.value++;
}
</script>

<style scoped>
/* Add your scoped styles here */
</style>
`;
    fs.writeFileSync(path.join(projectPath, "src", "App.vue"), appCode);
    fs.writeFileSync(path.join(projectPath, "src", "Counter.vue"), counterCode);
  },

  svelte: (projectPath, projectName, isTs) => {
    const code = `
<script ${isTs ? 'lang="ts"' : ""}>
  let count = 0;
  function increment() {
    count += 1;
  }
</script>

<main class="bg-gray-200 min-h-screen flex flex-col justify-center items-center">
  <h1 class="text-3xl font-bold mb-4">Welcome to Your Svelte App</h1>
  <div>
    <p class="text-xl font-bold">Count: {count}</p>
    <button on:click={increment} class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">Increment</button>
  </div>
  <footer class="absolute bottom-0 mb-4">
    <a href="https://github.com/ShantanuKudva/ShantanuKudva" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">GitHub</a>
  </footer>
</main>

<style>
  /* Add your styles here */
</style>
`;
    fs.writeFileSync(path.join(projectPath, "src", "App.svelte"), code);
  },

  solid: (projectPath, projectName, isTs) => {
    const extension = isTs ? "tsx" : "jsx";
    const code = `
import { createSignal } from "solid-js";

function Counter() {
  const [count, setCount] = createSignal(0);

  return (
    <div class="bg-gray-200 min-h-screen flex flex-col justify-center items-center">
      <p class="text-xl font-bold">Count: {count()}</p>
      <button onClick={() => setCount(count() + 1)} class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">Increment</button>
    </div>
  );
}

function App() {
  return (
    <div class="bg-gray-200 min-h-screen flex flex-col justify-center items-center">
      <h1 class="text-3xl font-bold mb-4">Welcome to Your Solid App</h1>
      <Counter />
      <footer class="absolute bottom-0 mb-4">
        <a href="https://github.com/ShantanuKudva/ShantanuKudva" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">GitHub</a>
      </footer>
    </div>
  );
}

export default App;
`;
    fs.writeFileSync(path.join(projectPath, "src", `main.${extension}`), code);
  },

  vanilla: (projectPath, projectName, isTs) => {
    const jsExtension = isTs ? "ts" : "js";
    const htmlCode = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Vanilla JS App</title>
  <link rel="stylesheet" href="./style.css">
</head>
<body class="bg-gray-200 min-h-screen flex flex-col justify-center items-center">
  <div id="app">
    <h1 class="text-3xl font-bold mb-4">Welcome to Your Vanilla JS App</h1>
    <div id="counter">
      <p class="text-xl font-bold">Count: <span id="count">0</span></p>
      <button id="incrementBtn" class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mt-4">Increment</button>
    </div>
    <footer class="absolute bottom-0 mb-4">
      <a href="https://github.com/ShantanuKudva/ShantanuKudva" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline">GitHub</a>
    </footer>
  </div>
  <script src="./main.${jsExtension}"></script>
</body>
</html>
`;

    const jsCode = `
document.addEventListener('DOMContentLoaded', () => {
  const countEl = document.getElementById('count');
  const incrementBtn = document.getElementById('incrementBtn');
  let count = 0;

  incrementBtn.addEventListener('click', () => {
    count++;
    countEl.textContent = count;
  });
});
`;

    fs.writeFileSync(path.join(projectPath, "index.html"), htmlCode);
    fs.writeFileSync(path.join(projectPath, `main.${jsExtension}`), jsCode);
  },
};
function addStubCode(projectPath, framework, projectName) {
  const isTs = framework.endsWith("-ts");
  const baseFramework = isTs ? framework.slice(0, -3) : framework;
  // console.log("🚀 ~ addStubCode ~ baseFramework:", baseFramework);

  if (stubFunctions[baseFramework]) {
    stubFunctions[baseFramework](projectPath, projectName, isTs);
    console.log(`${baseFramework} stub code added successfully.`);
  } else {
    console.error(`No stub code available for the ${baseFramework} framework.`);
  }
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
    { value: "solid", label: `${emoji.get("rocket")} Solid` },
    // { value: "svelte", label: `${emoji.get("orange_heart")} Svelte` },
    // { value: "qwik", label: `${emoji.get("globe_with_meridians")} Qwik` },
  ];

  // const linterOptions = [
  //   { value: "eslint", label: `${emoji.get("white_check_mark")} ESLint` },
  //   // { value: "tslint", label: `${emoji.get("no_entry")} TSLint (deprecated)` },
  //   { value: "prettier", label: `${emoji.get("nail_care")} Prettier` },
  //   // { value: "standard", label: `${emoji.get("barber")} Standard` },
  //   // { value: "airbnb", label: `${emoji.get("house_with_garden")} Airbnb` },
  //   // { value: "google", label: `${emoji.get("earth_americas")} Google` },
  //   // { value: "none", label: `${emoji.get("no_entry_sign")} None` },
  // ];

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

  // const linter = await multiselect({
  //   message: `${emoji.get(
  //     "gear"
  //   )} What linter do you want to use? (Select multiple) or select None`,
  //   options: linterOptions,
  //   required: false,
  // });

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
      console.log(chalk.bgBlue("running"), chalk.gray(stdout));
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
          console.log(chalk.bgBlue("running"), chalk.gray(stdout));
          addStubCode(projectPath, framework, projectName);
          if (!needTailwind) {
            spin.stop(chalk.bgGreenBright("Project created successfully! 🚀"));
            process.exit(0);
          } else {
            installTailwind(framework, projectPath, projectName, spin);
            spin.stop(chalk.bgGreenBright("Project created successfully! 🚀"));
          }
        }
      });
    }
  });
}

displayHeader();
// main().catch(console.error);

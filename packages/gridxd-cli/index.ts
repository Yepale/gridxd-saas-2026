#!/usr/bin/env node
import { Command } from "commander";
import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import chalk from "chalk";
import { finished } from "stream/promises";

const API_URL = process.env.GRIDXD_API_URL || "https://gridxd-main-production.up.railway.app/process-image";

const program = new Command();

program
  .name("gridxd")
  .description("CLI para detectar y extraer iconos automáticamente mediante GridXD")
  .version("1.1.0");

program
  .command("extract")
  .description("Extrae iconos de una lámina o spritesheet")
  .argument("<file>", "Ruta a la imagen (PNG/JPG)")
  .option("-o, --output <dir>", "Directorio de salida", ".")
  .option("-n, --name <name>", "Nombre del proyecto")
  .option("--no-upscale", "Desactiva el escalado automático a 2K")
  .option("--no-bg-removal", "Desactiva la eliminación de fondo transparente")
  .action(async (file, options) => {
    const filePath = path.resolve(process.cwd(), file);

    if (!fs.existsSync(filePath)) {
      console.error(chalk.red(`❌ Archivo no encontrado: ${filePath}`));
      process.exit(1);
    }

    try {
      console.log(chalk.cyan("🚀 Iniciando extracción con GridXD..."));

      const form = new FormData();
      form.append("image", fs.createReadStream(filePath));
      form.append("remove_background", String(!options.bgRemoval));
      form.append("upscale", String(!options.upscale));
      if (options.name) {
        form.append("project_name", options.name);
      }

      console.log(chalk.gray(`Subiendo ${path.basename(filePath)} al motor de IA...`));

      const response = await axios.post(API_URL, form, {
        headers: { ...form.getHeaders() },
        maxContentLength: Infinity,
        maxBodyLength: Infinity
      });

      if (response.data?.images?.length > 0) {
        const count = response.data.images.length;
        console.log(chalk.green(`✅ Procesamiento completado. ${count} iconos detectados.`));

        if (response.data.zipUrl) {
          const zipUrl = response.data.zipUrl.startsWith("http") 
            ? response.data.zipUrl 
            : new URL(response.data.zipUrl, API_URL).href;
          
          const outputDir = path.resolve(process.cwd(), options.output);
          if (!fs.existsSync(outputDir)) {
            fs.mkdirSync(outputDir, { recursive: true });
          }

          const zipName = path.basename(zipUrl);
          const downloadPath = path.join(outputDir, zipName);

          console.log(chalk.blue(`📥 Descargando ZIP: ${zipName}...`));
          
          const writer = fs.createWriteStream(downloadPath);
          const downloadRes = await axios.get(zipUrl, { responseType: "stream" });
          downloadRes.data.pipe(writer);
          await finished(writer);

          console.log(chalk.green(`✨ Pack guardado en: ${downloadPath}`));
        }
      } else {
        console.log(chalk.yellow("⚠️ No se detectaron iconos en la imagen."));
      }

    } catch (error: unknown) {
      console.error(chalk.red("❌ Error en el procesamiento:"));
      if (axios.isAxiosError(error)) {
        if (error.response?.data) {
          console.error(chalk.red(JSON.stringify(error.response.data, null, 2)));
        } else {
          console.error(chalk.red(error.message));
        }
      } else if (error instanceof Error) {
        console.error(chalk.red(error.message));
      }
      process.exit(1);
    }
  });

program.parse();


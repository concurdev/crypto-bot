import { createLogger, transports, format } from "winston";
import { RED_COLOR, RESET_COLOR, YELLOW_COLOR, CYAN_COLOR, GREEN_COLOR, BLUE_COLOR } from "./constants";

const packageName = `crypto-bot`;

const logger = createLogger({
  level: "info", // Set default logging level to 'info'
  format: format.combine(
    format.timestamp(),
    format.printf(({ timestamp, level, message }) => {
      let coloredLevel: string;

      // Apply color based on log level
      switch (level.toUpperCase()) {
        case "INFO":
          coloredLevel = `${CYAN_COLOR}${level.toUpperCase()}${RESET_COLOR}`;
          break;
        case "ERROR":
          coloredLevel = `${RED_COLOR}${level.toUpperCase()}${RESET_COLOR}`;
          break;
        case "WARN":
          coloredLevel = `${YELLOW_COLOR}${level.toUpperCase()}${RESET_COLOR}`;
          break;
        default:
          coloredLevel = `${level.toUpperCase()}`;
      }

      // Reformat the log output
      return `[${GREEN_COLOR}${packageName}${RESET_COLOR}] | ${BLUE_COLOR}${timestamp}${RESET_COLOR} [${coloredLevel}] : ${message}`;
    })
  ),
  transports: [new transports.Console(), new transports.File({ filename: "logs/app.log" })],
});

export default logger;

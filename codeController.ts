import { Request, Response, NextFunction } from "express";
import axios from "axios";
import { catchAsync, AppError } from "../utils/appError";

const WANDBOX_URL = "https://wandbox.org/api/compile.json";

const languageMap: Record<string, string> = {
  "JavaScript": "nodejs-20.17.0",
  "Python": "cpython-3.12.7",
  "C++": "gcc-13.2.0",
  "Java": "openjdk-jdk-22+36",
};

export const executeCode = catchAsync(async (req: Request, res: Response, next: NextFunction) => {
  const { code, language } = req.body as { code: string; language: string };

  if (!code || !language) {
    return next(new AppError("Code and language are required", 400));
  }

  const compiler = languageMap[language];
  if (!compiler) {
    return next(new AppError("Unsupported language", 400));
  }

  try {
    const response = await axios.post(WANDBOX_URL, {
      compiler: compiler,
      code: code,
      save: false
    });

    const data = response.data as { program_message?: string; compiler_message?: string; program_output?: string; compiler_error?: string };
    const output = data.program_message || data.compiler_message || data.program_output || data.compiler_error || "";

    return res.status(200).json({
      success: true,
      data: {
        output: output
      },
    });
  } catch (error: any) {
    return next(new AppError(error.response?.data?.message || "Failed to execute code", 500));
  }
});

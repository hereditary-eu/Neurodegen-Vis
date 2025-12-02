export interface MessageHistory {
  role: "system" | "user" | "assistant";
  content: string;
}

export class ChatCodeRes {
  functionName: string = "";
  code: string[] = ["", ""]; // todo, make different types of code possible!

  /**
   * Genreates ChatCodeRes instance from a JSON string, and checks if the JSON is valid.
   * @returns chatCodeRes instance
   */
  static fromJSON(json: string): ChatCodeRes {
    const obj = JSON.parse(json);
    if (!obj || typeof obj !== "object") {
      throw new Error("Invalid JSON format for ChatCodeRes");
    }

    // check if obj has keys function and code
    const hasExactKeys = (obj: any, keys: string[]): boolean => {
      const objKeys = Object.keys(obj).sort();
      const expectedKeys = keys.slice().sort();
      return objKeys.length === expectedKeys.length && objKeys.every((key, i) => key === expectedKeys[i]);
    };

    if (!hasExactKeys(obj, ["code", "function"])) {
      throw new Error(
        "Object must contain exactly the keys 'code' and 'function', but got: " + JSON.stringify(Object.keys(obj)),
      );
    }

    if (!obj.function || typeof obj.function !== "string") {
      throw new Error(
        "Invalid or missing 'function' in JSON, function must be a string, but got: " + JSON.stringify(obj.function),
      );
    }
    // check if code an array of strings
    if (!obj.code || !Array.isArray(obj.code) || !obj.code.every((item: any) => typeof item === "string")) {
      throw new Error(
        "Invalid or missing 'code' in JSON — must be array of strings, but got: " + JSON.stringify(obj.code),
      );
    }

    const instance = new ChatCodeRes();
    instance.functionName = obj.function;
    instance.code = obj.code; //
    return instance;
  }
}
